import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../user/types/authenticated-user.type';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandProfileDto } from './dto/update-brand-profile.dto';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createBrandDto: CreateBrandDto, adminUserId: number) {
    const brand = this.brandRepository.create({
      ...createBrandDto,
      createdById: adminUserId,
    });

    return this.brandRepository.save(brand);
  }

  findAll() {
    return this.brandRepository.find({
      order: { id: 'ASC' },
    });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto) {
    const brand = await this.findOne(id);

    Object.assign(brand, updateBrandDto);

    return this.brandRepository.save(brand);
  }

  async updateStatus(id: number, updateBrandStatusDto: UpdateBrandStatusDto) {
    const brand = await this.findOne(id);

    brand.status = updateBrandStatusDto.status;

    return this.brandRepository.save(brand);
  }

  async updateOwnProfile(
    updateBrandProfileDto: UpdateBrandProfileDto,
    requester: AuthenticatedUser,
  ) {
    if (!requester.brandId) {
      throw new ForbiddenException('Brand account is not linked to a brand');
    }

    return this.updateProfile(
      requester.brandId,
      updateBrandProfileDto,
      requester,
    );
  }

  async updateProfile(
    id: number,
    updateBrandProfileDto: UpdateBrandProfileDto,
    requester: AuthenticatedUser,
  ) {
    this.assertCanUpdateBrand(id, requester);

    const brand = await this.findOne(id);
    const user = await this.resolveProfileUser(
      id,
      requester,
      updateBrandProfileDto,
    );

    this.assignBrandProfileFields(brand, updateBrandProfileDto);

    if (user) {
      await this.assignUserProfileFields(user, updateBrandProfileDto);
    }

    const { savedBrand, savedUser } =
      await this.brandRepository.manager.transaction(async (manager) => ({
        savedBrand: await manager.save(Brand, brand),
        savedUser: user ? await manager.save(User, user) : null,
      }));

    return {
      brand: savedBrand,
      user: savedUser ? this.serializeUser(savedUser) : null,
    };
  }

  async remove(id: number) {
    const brand = await this.findOne(id);

    await this.brandRepository.remove(brand);

    return { message: 'Brand deleted successfully' };
  }

  private async findOne(id: number) {
    const brand = await this.brandRepository.findOne({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return brand;
  }

  private assertCanUpdateBrand(id: number, requester: AuthenticatedUser) {
    if (requester.role === UserRole.ADMIN) {
      return;
    }

    if (requester.role === UserRole.BRAND && requester.brandId === id) {
      return;
    }

    throw new ForbiddenException('You can update only your own brand profile');
  }

  private async resolveProfileUser(
    brandId: number,
    requester: AuthenticatedUser,
    updateBrandProfileDto: UpdateBrandProfileDto,
  ) {
    if (!this.hasUserProfileChanges(updateBrandProfileDto)) {
      return null;
    }

    const user =
      requester.role === UserRole.BRAND
        ? await this.userRepository.findOne({ where: { id: requester.id } })
        : await this.userRepository.findOne({
            where: { brandId, role: UserRole.BRAND },
            order: { id: 'ASC' },
          });

    if (!user) {
      throw new NotFoundException('Brand user not found');
    }

    return user;
  }

  private hasUserProfileChanges(updateBrandProfileDto: UpdateBrandProfileDto) {
    return Boolean(
      updateBrandProfileDto.email ||
      updateBrandProfileDto.password ||
      updateBrandProfileDto.fullName,
    );
  }

  private assignBrandProfileFields(
    brand: Brand,
    updateBrandProfileDto: UpdateBrandProfileDto,
  ) {
    if (updateBrandProfileDto.name !== undefined) {
      brand.name = updateBrandProfileDto.name;
    }

    if (updateBrandProfileDto.description !== undefined) {
      brand.description = updateBrandProfileDto.description;
    }

    const logoUrl = updateBrandProfileDto.logoUrl ?? updateBrandProfileDto.logo;

    if (logoUrl !== undefined) {
      brand.logoUrl = logoUrl;
    }
  }

  private async assignUserProfileFields(
    user: User,
    updateBrandProfileDto: UpdateBrandProfileDto,
  ) {
    if (
      updateBrandProfileDto.email !== undefined &&
      updateBrandProfileDto.email !== user.email
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateBrandProfileDto.email },
      });

      if (existingUser && existingUser.id !== user.id) {
        throw new ConflictException('Email already exists');
      }

      user.email = updateBrandProfileDto.email;
    }

    if (updateBrandProfileDto.fullName !== undefined) {
      user.fullName = updateBrandProfileDto.fullName;
    }

    if (updateBrandProfileDto.password !== undefined) {
      user.password = await bcrypt.hash(updateBrandProfileDto.password, 10);
    }
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      brandId: user.brandId,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
