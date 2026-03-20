import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { ContractType, WorkMode, JobHardSkillReq } from '@amalia/shared'

@Entity('job_offers')
export class JobOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User

  @Column()
  authorId: string

  @Column()
  title: string

  @Column('text')
  description: string

  @Column({ type: 'int', nullable: true })
  salaryMin: number | null

  @Column({ type: 'int', nullable: true })
  salaryMax: number | null

  @Column({ type: 'enum', enum: ContractType })
  contractType: ContractType

  @Column({ type: 'enum', enum: WorkMode })
  workMode: WorkMode

  @Column({ nullable: true })
  location: string | null

  @Column({ type: 'int', default: 0 })
  yearsRequired: number

  @Column()
  sector: string

  @Column({ type: 'jsonb', default: [] })
  hardSkills: JobHardSkillReq[]

  @Column({ type: 'simple-array', nullable: true })
  softSkills: string[]

  @Column({ type: 'varchar', default: 'active' })
  status: string

  @Column({ type: 'timestamptz' })
  expiresAt: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
