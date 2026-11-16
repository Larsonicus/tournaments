import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthResponseDto, LoginDto, RegisterDto, UserDto } from './auth.dto.js';
import { AuthService } from './auth.service.js';
import type { AuthUser } from './jwt.strategy.js';
import { Auth, CurrentUser } from './roles.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные поля' })
  @ApiConflictResponse({ description: 'Email уже занят' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.auth.login(dto);
  }

  @Get('me')
  @Auth()
  @ApiOkResponse({ type: UserDto })
  me(@CurrentUser() user: AuthUser): Promise<UserDto> {
    return this.auth.me(user.id);
  }
}
