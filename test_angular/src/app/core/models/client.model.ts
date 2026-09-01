export interface Client {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    createdAt: string;
}

export interface CreateClientDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
}

export interface UpdateClientDto {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
}