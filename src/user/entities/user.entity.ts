import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  BRAND = 'BRAND',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()   // Never return password in responses
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BRAND })
  role: UserRole;

  @Column({ nullable: true })
  fullName: string;

  @Column({ type: 'int', nullable: true })
  brandId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
