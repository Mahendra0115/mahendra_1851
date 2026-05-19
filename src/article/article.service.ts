import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { Brand } from '../brand/entities/brand.entity';
import { AuthenticatedUser } from '../user/types/authenticated-user.type';
import { UserRole } from '../user/entities/user.entity';
import {
  ArticleListQueryDto,
  ArticleSearchQueryDto,
} from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleStatusDto } from './dto/update-article-status.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(BrandAuthor)
    private readonly brandAuthorRepository: Repository<BrandAuthor>,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    requester: AuthenticatedUser,
  ) {
    const brandId = await this.resolveCreateBrandId(
      createArticleDto,
      requester,
    );

    await this.assertBrandExists(brandId);

    const article = this.articleRepository.create({
      title: createArticleDto.title,
      content: createArticleDto.content,
      brandId,
      authorId: requester.id,
    });

    return this.articleRepository.save(article);
  }

  async findMine(requester: AuthenticatedUser) {
    if (requester.role === UserRole.BRAND) {
      if (!requester.brandId) {
        throw new ForbiddenException('Brand account is not linked to a brand');
      }

      return this.articleRepository.find({
        where: { brandId: requester.brandId },
        order: { id: 'ASC' },
      });
    }

    if (requester.role === UserRole.AUTHOR) {
      return this.articleRepository.find({
        where: { authorId: requester.id },
        order: { id: 'ASC' },
      });
    }

    throw new ForbiddenException(
      'Only brand and author users can list articles',
    );
  }

  findPublished(query: ArticleListQueryDto, brandId?: number) {
    return this.findPublishedArticles(query, { brandId });
  }

  async findPublishedById(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id, status: ArticleStatus.PUBLISHED },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  searchPublished(query: ArticleSearchQueryDto) {
    return this.findPublishedArticles(query, { search: query.query });
  }

  async findMyPublished(
    query: ArticleListQueryDto,
    requester: AuthenticatedUser,
  ) {
    if (requester.role !== UserRole.BRAND) {
      throw new ForbiddenException('Only brand users can list brand articles');
    }

    if (!requester.brandId) {
      throw new ForbiddenException('Brand account is not linked to a brand');
    }

    return this.findPublishedArticles(query, { brandId: requester.brandId });
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    requester: AuthenticatedUser,
  ) {
    const article = await this.findOne(id);

    this.assertCanModify(article, requester);

    Object.assign(article, updateArticleDto);

    return this.articleRepository.save(article);
  }

  async remove(id: number, requester: AuthenticatedUser) {
    const article = await this.findOne(id);

    this.assertCanModify(article, requester);

    await this.articleRepository.remove(article);

    return { message: 'Article deleted successfully' };
  }

  async updateStatus(
    id: number,
    updateArticleStatusDto: UpdateArticleStatusDto,
  ) {
    const article = await this.findOne(id);

    if (
      updateArticleStatusDto.status === ArticleStatus.PUBLISHED &&
      article.status !== ArticleStatus.PUBLISHED
    ) {
      article.publishedAt = new Date();
    }

    if (updateArticleStatusDto.status !== ArticleStatus.PUBLISHED) {
      article.publishedAt = null;
    }

    article.status = updateArticleStatusDto.status;

    return this.articleRepository.save(article);
  }

  private async findPublishedArticles(
    query: ArticleListQueryDto,
    filters: { brandId?: number; search?: string } = {},
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'publishedAt';
    const order = query.order ?? 'desc';

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .where('article.status = :status', { status: ArticleStatus.PUBLISHED });

    if (filters.brandId !== undefined) {
      queryBuilder.andWhere('article.brandId = :brandId', {
        brandId: filters.brandId,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('article.title ILIKE :search', {
            search: `%${filters.search}%`,
          }).orWhere('article.content ILIKE :search', {
            search: `%${filters.search}%`,
          });
        }),
      );
    }

    const [data, total] = await queryBuilder
      .orderBy(`article.${sortBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  private async resolveCreateBrandId(
    createArticleDto: CreateArticleDto,
    requester: AuthenticatedUser,
  ) {
    if (requester.role === UserRole.BRAND) {
      if (!requester.brandId) {
        throw new ForbiddenException('Brand account is not linked to a brand');
      }

      if (
        createArticleDto.brandId !== undefined &&
        createArticleDto.brandId !== requester.brandId
      ) {
        throw new ForbiddenException(
          'You can create articles only for your brand',
        );
      }

      return requester.brandId;
    }

    if (requester.role === UserRole.AUTHOR) {
      if (!createArticleDto.brandId) {
        throw new BadRequestException('brandId is required for AUTHOR user');
      }

      const assignment = await this.brandAuthorRepository.findOne({
        where: {
          brandId: createArticleDto.brandId,
          authorId: requester.id,
        },
      });

      if (!assignment) {
        throw new ForbiddenException(
          'You can create articles only for assigned brands',
        );
      }

      return createArticleDto.brandId;
    }

    throw new ForbiddenException(
      'Only brand and author users can create articles',
    );
  }

  private async findOne(id: number) {
    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  private async assertBrandExists(brandId: number) {
    const brand = await this.brandRepository.findOne({
      where: { id: brandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
  }

  private assertCanModify(article: Article, requester: AuthenticatedUser) {
    if (
      requester.role === UserRole.BRAND &&
      requester.brandId === article.brandId
    ) {
      return;
    }

    if (
      requester.role === UserRole.AUTHOR &&
      requester.id === article.authorId
    ) {
      return;
    }

    throw new ForbiddenException('You can modify only allowed articles');
  }
}
