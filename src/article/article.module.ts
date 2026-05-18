import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { Brand } from '../brand/entities/brand.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Article, Brand, BrandAuthor])],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
