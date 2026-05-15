import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { PostRegisterController } from './controllers/post-register.controller';
import { PostLoginController } from './controllers/post-login.controller';
import { RegisterUseCase } from './usecases/register.usecase';
import { LoginUseCase } from './usecases/login.usecase';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { GithubLoginUseCase } from './usecases/github-login.usecase';
import { GetGithubCallbackController } from './controllers/get-github-callback.controller';
import { GetGithubController } from './controllers/get-github.controller';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permission.entity';
import { UserPermission } from '../entities/user-permission.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { BanGuard } from './guards/ban.guard';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Permission, UserPermission]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [
    PostRegisterController,
    PostLoginController,
    GetGithubController,
    GetGithubCallbackController,
  ],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    GithubLoginUseCase,
    JwtStrategy,
    GithubStrategy,
    PermissionsGuard,
    BanGuard,
  ],
  exports: [JwtModule, PermissionsGuard, BanGuard, TypeOrmModule],
})
export class AuthModule {}
