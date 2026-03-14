import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { PostRegisterController } from './controllers/post-register.controller'
import { PostLoginController } from './controllers/post-login.controller'
import { RegisterUseCase } from './usecases/register.usecase'
import { LoginUseCase } from './usecases/login.usecase'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [PostRegisterController, PostLoginController],
  providers: [AuthService, RegisterUseCase, LoginUseCase, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}