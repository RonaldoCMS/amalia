import { Module } from '@nestjs/common';
import { ChallengesModule } from './challenges/challenges.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Challenge } from './entities/challenge.entity';
import { UserChallenge } from './entities/user-challenge.entity';
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '../../.env',  isGlobal: true }),
      TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Challenge, UserChallenge],
        synchronize: true,
      }),
    }),
    SharedModule,
    AuthModule,
    ChallengesModule,
  ],
})
export class AppModule {}
