import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { Brand } from './entities/brand.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, User, BrandAuthor]), UserModule],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandModule {}
