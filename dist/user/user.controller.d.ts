import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
    createUser(createUserDto: CreateUserDto): Promise<{
        id: number;
        email: string;
        role: UserRole;
        fullName: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
