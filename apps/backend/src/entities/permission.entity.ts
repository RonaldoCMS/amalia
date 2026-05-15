import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

export enum PermissionCategoryEnum {
  Moderation = 'moderation',
  Admin = 'admin',
  Founder = 'founder',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  key: string

  @Column()
  description: string

  @Column({ type: 'varchar', default: PermissionCategoryEnum.Moderation })
  category: PermissionCategoryEnum
}
