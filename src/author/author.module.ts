import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../article/entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { MailModule } from '../mail/mail.module';
import { User } from '../user/entities/user.entity';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BrandAuthor, Article]), MailModule],
  controllers: [AuthorController],
  providers: [AuthorService],
})
export class AuthorModule {}
