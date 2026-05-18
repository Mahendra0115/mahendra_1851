import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../user/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { RolesGuard } from '../user/guards/roles.guard';
import type { AuthenticatedRequest } from '../user/types/authenticated-request.type';
import { ArticleService } from './article.service';
import {
  ArticleListQueryDto,
  ArticleSearchQueryDto,
} from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('public/articles')
export class PublicArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  findPublished(@Query() query: ArticleListQueryDto) {
    return this.articleService.findPublished(query);
  }

  @Get('search')
  searchPublished(@Query() query: ArticleSearchQueryDto) {
    return this.articleService.searchPublished(query);
  }

  @Get('brand/:brandId')
  findPublishedByBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Query() query: ArticleListQueryDto,
  ) {
    return this.articleService.findPublished(query, brandId);
  }

  @Get(':id')
  findPublishedById(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findPublishedById(id);
  }
}

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

  @Get('published')
  @Roles(UserRole.BRAND)
  findMyPublished(
    @Query() query: ArticleListQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.findMyPublished(query, request.user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.update(id, updateArticleDto, request.user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleStatusDto: UpdateArticleStatusDto,
  ) {
    return this.articleService.updateStatus(id, updateArticleStatusDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.articleService.remove(id, request.user);
  }
}
