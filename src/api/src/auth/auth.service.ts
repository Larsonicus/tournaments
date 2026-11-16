import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import type { User } from '../db/schema.js';
import type { AuthResponseDto, LoginDto, RegisterDto, UserDto } from './auth.dto.js';
import type { JwtPayload } from './jwt.strategy.js';
import { UsersRepository } from './users.repository.js';

const BCRYPT_ROUNDS = 10;
const UNIQUE_VIOLATION = '23505';

export function toUserDto({ id, email, name, role, rating }: User): UserDto {
  return { id, email, name, role, rating };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('Email уже занят');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      const user = await this.users.create({ email: dto.email, name: dto.name, role: dto.role, passwordHash });
      return this.issueToken(user);
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException('Email уже занят');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return this.issueToken(user);
  }

  async me(id: number): Promise<UserDto> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new UnauthorizedException();
    }
    return toUserDto(user);
  }

  private async issueToken(user: User): Promise<AuthResponseDto> {
    const payload: JwtPayload = { sub: user.id, role: user.role };
    return { accessToken: await this.jwt.signAsync(payload), user: toUserDto(user) };
  }
}
