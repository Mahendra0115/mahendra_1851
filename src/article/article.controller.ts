import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import type { AuthenticatedRequest } from '../user/types/authenticated-request.type';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
@Roles(UserRole.BRAND, UserRole.AUTHOR)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.create(createArticleDto, request.user);
  }

  @Get()
  findMine(@Req() request: AuthenticatedRequest) {
    return this.articleService.findMine(request.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.update(id, updateArticleDto, request.user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.remove(id, request.user);
  }
}
