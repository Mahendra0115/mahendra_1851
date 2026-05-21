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
import { AuthorService } from './author.service';
import { AuthorQueryDto } from './dto/author-query.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorProfileDto } from './dto/update-author-profile.dto';

@Controller('authors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: AuthorQueryDto) {
    return this.authorService.findAll(query);
  }

  @Get('me')
  @Roles(UserRole.AUTHOR)
  findOwnProfile(@Req() request: AuthenticatedRequest) {
    return this.authorService.findOwnProfile(request.user);
  }

  @Patch('me')
  @Roles(UserRole.AUTHOR)
  updateOwnProfile(
    @Body() updateAuthorProfileDto: UpdateAuthorProfileDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.authorService.updateOwnProfile(
      request.user,
      updateAuthorProfileDto,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.findOneWithBrands(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.authorService.remove(id);
  }
}
