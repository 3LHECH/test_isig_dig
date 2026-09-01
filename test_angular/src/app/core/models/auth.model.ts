export interface UserLogin {
    email: string;
    password?: string;
}

export interface AuthResponse {
    message: string;
}
export interface UserRegisterDto {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
}