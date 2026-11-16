import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { roleEnum, type Role } from '../db/schema.js';

export class LoginDto {
  @ApiProperty({ example: 'player@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: 'secret123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({ example: 'Иван' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ enum: roleEnum.enumValues })
  @IsIn(roleEnum.enumValues)
  role!: Role;
}

export class UserDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ enum: roleEnum.enumValues })
  role!: Role;

  @ApiProperty({ example: 1000 })
  rating!: number;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: UserDto })
  user!: UserDto;
}
