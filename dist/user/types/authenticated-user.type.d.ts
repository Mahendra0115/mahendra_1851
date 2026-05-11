import { UserRole } from '../entities/user.entity';
export interface AuthenticatedUser {
    id: number;
    email: string;
    role: UserRole;
}
