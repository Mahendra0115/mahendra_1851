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
import { BrandService } from './brand.service';
import { AssignAuthorDto } from './dto/assign-author.dto';
import { BrandProfileQueryDto } from './dto/brand-profile-query.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandProfileDto } from './dto/update-brand-profile.dto';
import { UpdateBrandStatusDto } from './dto/update-brand-status.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(
    @Body() createBrandDto: CreateBrandDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.create(createBrandDto, request.user.id);
  }

  @Get()
  findAll(
    @Query() query: BrandProfileQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.findAll(query, request.user);
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

  @Get(':id/articles')
  findPublishedArticles(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: BrandProfileQueryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.findPublishedArticles(id, query, request.user);
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
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandStatusDto: UpdateBrandStatusDto,
  ) {
    return this.brandService.updateStatus(id, updateBrandStatusDto);
  }

  @Post(':id/authors')
  @Roles(UserRole.ADMIN)
  assignAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignAuthorDto: AssignAuthorDto,
  ) {
    return this.brandService.assignAuthor(id, assignAuthorDto.authorId);
  }

  @Get(':id/authors')
  @Roles(UserRole.ADMIN)
  findAuthors(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findAuthors(id);
  }

  @Delete(':id/authors/:authorId')
  @Roles(UserRole.ADMIN)
  removeAuthor(
    @Param('id', ParseIntPipe) id: number,
    @Param('authorId', ParseIntPipe) authorId: number,
  ) {
    return this.brandService.removeAuthor(id, authorId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.remove(id);
  }

  @Get(':id')
  findProfile(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.brandService.findProfile(id, request.user);
  }
}
