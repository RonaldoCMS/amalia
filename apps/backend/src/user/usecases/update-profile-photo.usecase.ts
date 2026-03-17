import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'

interface MulterFile {
  filename: string
  originalname: string
  mimetype: string
  size: number
}

@Injectable()
export class UpdateProfilePhotoUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, file: MulterFile): Promise<{ profilePhotoUrl: string }> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')
    const url = `/uploads/profile-photos/${file.filename}`
    await this.userRepository.updateProfilePhoto(userId, url)
    return { profilePhotoUrl: url }
  }
}
