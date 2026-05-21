import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Article } from '../article/entities/article.entity';
import { BrandAuthor } from '../brand-author/entities/brand-author.entity';
import { AppMailService } from '../mail/mail.service';
import { AuthenticatedUser } from '../user/types/authenticated-user.type';
import { User, UserRole } from '../user/entities/user.entity';
import { AuthorQueryDto } from './dto/author-query.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorProfileDto } from './dto/update-author-profile.dto';

@Injectable()
export class AuthorService {
  private readonly logger = new Logger(AuthorService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BrandAuthor)
    private readonly brandAuthorRepository: Repository<BrandAuthor>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly mailService: AppMailService,
  ) {}

  async create(createAuthorDto: CreateAuthorDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthorDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const author = this.userRepository.create({
      email: createAuthorDto.email,
      password: await bcrypt.hash(createAuthorDto.password, 10),
      fullName: createAuthorDto.name,
      role: UserRole.AUTHOR,
      brandId: null,
    });

    const savedAuthor = await this.userRepository.save(author);
    await this.sendAuthorCredentials(savedAuthor, createAuthorDto.password);

    return this.serializeAuthor(savedAuthor);
  }

  async findAll(query: AuthorQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [authors, total] = await this.userRepository.findAndCount({
      where: { role: UserRole.AUTHOR },
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: authors.map((author) => this.serializeAuthor(author)),
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async findOneWithBrands(id: number) {
    const author = await this.findAuthor(id);

    return {
      ...this.serializeAuthor(author),
      brands: await this.findAssignedBrands(id),
    };
  }

  async findOwnProfile(requester: AuthenticatedUser) {
    return this.findOneWithBrands(requester.id);
  }

  async updateOwnProfile(
    requester: AuthenticatedUser,
    updateAuthorProfileDto: UpdateAuthorProfileDto,
  ) {
    const author = await this.findAuthor(requester.id);

    if (
      updateAuthorProfileDto.email !== undefined &&
      updateAuthorProfileDto.email !== author.email
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateAuthorProfileDto.email },
      });

      if (existingUser && existingUser.id !== author.id) {
        throw new BadRequestException('Email already exists');
      }

      author.email = updateAuthorProfileDto.email;
    }

    if (updateAuthorProfileDto.name !== undefined) {
      author.fullName = updateAuthorProfileDto.name;
    }

    if (updateAuthorProfileDto.password !== undefined) {
      author.password = await bcrypt.hash(updateAuthorProfileDto.password, 10);
    }

    const savedAuthor = await this.userRepository.save(author);

    return {
      ...this.serializeAuthor(savedAuthor),
      brands: await this.findAssignedBrands(savedAuthor.id),
    };
  }

  async remove(id: number) {
    const author = await this.findAuthor(id);
    const articlesCount = await this.articleRepository.count({
      where: { authorId: id },
    });

    if (articlesCount > 0) {
      throw new ConflictException(
        'Author has articles, please reassign or delete them first',
      );
    }

    await this.userRepository.manager.transaction(async (manager) => {
      await manager.delete(BrandAuthor, { authorId: id });
      await manager.remove(User, author);
    });

    return { message: 'Author deleted successfully' };
  }

  private async findAuthor(id: number) {
    const author = await this.userRepository.findOne({
      where: { id, role: UserRole.AUTHOR },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    return author;
  }

  private async findAssignedBrands(authorId: number) {
    const assignments = await this.brandAuthorRepository.find({
      where: { authorId },
      relations: { brand: true },
      order: { id: 'ASC' },
    });

    return assignments.map((assignment) => assignment.brand);
  }

  private serializeAuthor(author: User) {
    return {
      id: author.id,
      name: author.fullName,
      email: author.email,
      role: author.role,
      brandId: author.brandId,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  }

  private async sendAuthorCredentials(author: User, plainPassword: string) {
    try {
      await this.mailService.sendAuthorCredentials({
        email: author.email,
        password: plainPassword,
        name: author.fullName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Author credentials email could not be sent to ${author.email}: ${message}`,
      );
    }
  }
}
