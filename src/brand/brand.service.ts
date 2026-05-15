import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
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
}
