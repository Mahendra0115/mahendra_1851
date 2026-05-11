import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from './entities/user.entity';
export declare class UserService implements OnModuleInit {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    signup(createUserDto: CreateUserDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: UserRole;
            fullName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            role: UserRole;
            fullName: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    createByAdmin(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        role: UserRole;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private createUser;
    private buildAuthResponse;
    private serializeUser;
    private seedAdmin;
}
