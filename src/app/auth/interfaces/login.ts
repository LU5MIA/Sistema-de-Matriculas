import { Roles } from "../../shared/interfaces/roles.interface";

export interface Login {
    username: string;
    password: string;
}

export interface LoginResponse {
    rol: any;
    access_token: string;
    user: {
        user_id: number;
        username: string;
        rol:Roles;
    };
}
