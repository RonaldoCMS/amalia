import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user.entity'
import { JobOffer } from './job-offer.entity'

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => JobOffer, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offerId' })
  offer: JobOffer

  @Column()
  offerId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recruiterId' })
  recruiter: User

  @Column()
  recruiterId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'developerId' })
  developer: User

  @Column()
  developerId: string

  @Column({ type: 'int', default: 0 })
  matchPercentage: number

  @Column({ type: 'varchar', default: 'sent' })
  status: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
