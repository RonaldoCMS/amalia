import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('app_config')
export class AppConfig {
  @PrimaryColumn() key: string
  @Column('text') value: string
}
