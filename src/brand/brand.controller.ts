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
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandProfileDto } from './dto/update-brand-profile.dto';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  create(
    @Body() createBrandDto: CreateBrandDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.create(createBrandDto, request.user.id);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Patch('me')
  @Roles(UserRole.BRAND)
  updateOwnProfile(
    @Body() updateBrandProfileDto: UpdateBrandProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.updateOwnProfile(
      updateBrandProfileDto,
      request.user,
    );
  }

  @Patch(':id/profile')
  @Roles(UserRole.ADMIN, UserRole.BRAND)
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandProfileDto: UpdateBrandProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.updateProfile(
      id,
      updateBrandProfileDto,
      request.user,
    );
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandStatusDto: UpdateBrandStatusDto,
  ) {
    return this.brandService.updateStatus(id, updateBrandStatusDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }
}
