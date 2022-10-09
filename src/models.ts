// Copyright (c) 2022 hvqzao@gmail.com, All Rights Reserved.

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('users')
class User {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number

  @Column({ type: 'text' })
  username!: string

  @Column({ type: 'text' })
  password!: string
}

export { User }
