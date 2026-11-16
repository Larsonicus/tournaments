import { Controller, type INestApplication, Post, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AuthModule } from '../../../../src/api/src/auth/auth.module.js';
import { Auth } from '../../../../src/api/src/auth/roles.guard.js';
import { UsersRepository } from '../../../../src/api/src/auth/users.repository.js';
import { InMemoryUsersRepository } from './in-memory-users.repository.js';

@Controller('organizer-only')
class OrganizerOnlyController {
  @Post()
  @Auth('ORGANIZER')
  create(): { ok: true } {
    return { ok: true };
  }
}

const register = (app: INestApplication<App>, role: string, email = `${role}@example.com`) =>
  request(app.getHttpServer()).post('/auth/register').send({ email, password: 'secret123', name: role, role });

describe('Auth HTTP', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test';
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [OrganizerOnlyController],
    })
      .overrideProvider(UsersRepository)
      .useValue(new InMemoryUsersRepository())
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('registers, logs in and returns the profile by token', async () => {
    await register(app, 'PLAYER').expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'PLAYER@example.com', password: 'secret123' })
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200)
      .expect(({ body }) => expect(body).toMatchObject({ email: 'PLAYER@example.com', role: 'PLAYER', rating: 1000 }));
  });

  it.each([
    ['short password', { email: 'a@example.com', password: 'short', name: 'A', role: 'PLAYER' }, 'password'],
    ['unknown role', { email: 'b@example.com', password: 'secret123', name: 'B', role: 'ADMIN' }, 'role'],
    ['invalid email', { email: 'not-an-email', password: 'secret123', name: 'C', role: 'PLAYER' }, 'email'],
  ])('rejects %s with 400 naming the field', async (_case, body, field) => {
    const response = await request(app.getHttpServer()).post('/auth/register').send(body).expect(400);

    expect(JSON.stringify(response.body.message)).toContain(field);
  });

  it('returns 401 without a token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
    await request(app.getHttpServer()).post('/organizer-only').expect(401);
  });

  it('returns 403 when a player calls an organizer method and allows an organizer', async () => {
    const playerToken = (await register(app, 'PLAYER', 'p2@example.com')).body.accessToken;
    const organizerToken = (await register(app, 'ORGANIZER')).body.accessToken;

    await request(app.getHttpServer())
      .post('/organizer-only')
      .set('Authorization', `Bearer ${playerToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .post('/organizer-only')
      .set('Authorization', `Bearer ${organizerToken}`)
      .expect(201);
  });
});
