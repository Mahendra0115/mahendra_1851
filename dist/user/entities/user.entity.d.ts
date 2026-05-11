export declare enum UserRole {
    ADMIN = "ADMIN",
    BRAND = "BRAND"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
}
