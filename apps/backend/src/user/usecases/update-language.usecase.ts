import { Injectable } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'

const VALID_LOCALES = ['it', 'en', 'de', 'fr', 'es', 'pt', 'ru']

@Injectable()
export class UpdateLanguageUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, language: string): Promise<void> {
    const lang = VALID_LOCALES.includes(language) ? language : null
    await this.userRepository.updateLanguage(userId, lang)
  }
}
