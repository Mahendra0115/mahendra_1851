import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Brand } from '../brand/entities/brand.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  async signup(createUserDto: CreateUserDto) {
    const user = await this.createUser({
      ...createUserDto,
      role: UserRole.BRAND,
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async createByAdmin(createUserDto: CreateUserDto) {
    const user = await this.createUser({
      ...createUserDto,
      role: createUserDto.role || UserRole.BRAND,
    });

    return this.serializeUser(user);
  }

  private async createUser(createUserDto: CreateUserDto) {
    const role = createUserDto.role || UserRole.BRAND;
    const brandId = await this.resolveBrandId(role, createUserDto.brandId);

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
      role,
      brandId,
    });

    return this.userRepository.save(user);
  }

  private async resolveBrandId(role: UserRole, brandId?: number) {
    if (role === UserRole.ADMIN) {
      return null;
    }

    const parsedBrandId = Number(brandId);

    if (!Number.isInteger(parsedBrandId)) {
      throw new BadRequestException('brandId is required for BRAND user');
    }

    const brand = await this.brandRepository.findOne({
      where: { id: parsedBrandId },
    });

    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    return parsedBrandId;
  }

  private buildAuthResponse(user: User) {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        brandId: user.brandId,
      }),
      user: this.serializeUser(user),
    };
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

  private async seedAdmin() {
    const email = 'admin@email.com';
    const existingAdmin = await this.userRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return;
    }

    const admin = this.userRepository.create({
      email,
      password: await bcrypt.hash('admin', 10),
      role: UserRole.ADMIN,
      fullName: 'Admin',
    });

    await this.userRepository.save(admin);
  }
}
