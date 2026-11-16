import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../../src/api/src/auth/auth.service.js';
import type { UsersRepository } from '../../../../src/api/src/auth/users.repository.js';
import { InMemoryUsersRepository } from './in-memory-users.repository.js';

const player = { email: 'player@example.com', password: 'secret123', name: 'Иван', role: 'PLAYER' as const };

describe('AuthService', () => {
  let repo: InMemoryUsersRepository;
  let jwt: JwtService;
  let service: AuthService;

  beforeEach(() => {
    repo = new InMemoryUsersRepository();
    jwt = new JwtService({ secret: 'test' });
    service = new AuthService(repo as unknown as UsersRepository, jwt);
  });

  it('registers a player with rating 1000 and returns a token with id and role', async () => {
    const result = await service.register(player);

    expect(result.user).toEqual({ id: 1, email: player.email, name: 'Иван', role: 'PLAYER', rating: 1000 });
    expect(jwt.verify(result.accessToken)).toMatchObject({ sub: 1, role: 'PLAYER' });
    expect(repo.items[0].passwordHash).not.toBe(player.password);
  });

  it('rejects a taken email with 409', async () => {
    await service.register(player);

    await expect(service.register(player)).rejects.toThrow(new ConflictException('Email уже занят'));
  });

  it('maps a unique violation from the database to 409', async () => {
    repo.create = () => Promise.reject(Object.assign(new Error('duplicate'), { code: '23505' }));

    await expect(service.register(player)).rejects.toBeInstanceOf(ConflictException);
  });

  it('logs in with valid credentials', async () => {
    await service.register(player);

    const result = await service.login({ email: player.email, password: player.password });

    expect(result.user.email).toBe(player.email);
  });

  it.each([
    ['wrong password', { email: player.email, password: 'wrong-pass' }],
    ['unknown email', { email: 'nobody@example.com', password: player.password }],
  ])('rejects %s with the same 401 message', async (_case, credentials) => {
    await service.register(player);

    await expect(service.login(credentials)).rejects.toThrow(new UnauthorizedException('Неверный email или пароль'));
  });

  it('returns the profile of the current user', async () => {
    const { user } = await service.register(player);

    await expect(service.me(user.id)).resolves.toEqual(user);
  });
});
