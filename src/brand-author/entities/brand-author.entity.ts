import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Brand } from '../../brand/entities/brand.entity';
import { User } from '../../user/entities/user.entity';

@Entity('brand_authors')
@Unique(['brandId', 'authorId'])
export class BrandAuthor {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Brand, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brandId' })
  brand: Brand;

  @Column({ type: 'int' })
  brandId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'int' })
  authorId: number;

  @CreateDateColumn()
  createdAt: Date;
}
