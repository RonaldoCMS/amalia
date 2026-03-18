import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    return {
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
    }
  }
}