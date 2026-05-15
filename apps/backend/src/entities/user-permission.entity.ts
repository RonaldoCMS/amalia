import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { User } from './user.entity'
import { Permission } from './permission.entity'

@Entity('user_permissions')
@Unique(['user', 'permission'])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User

  @ManyToOne(() => Permission, { eager: true, onDelete: 'CASCADE' })
  permission: Permission

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  grantedBy: User | null

  @CreateDateColumn()
  grantedAt: Date
}
