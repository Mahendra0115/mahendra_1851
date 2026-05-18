import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';
import { User } from '../../user/entities/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Brand, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'int' })
  brandId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'int' })
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
