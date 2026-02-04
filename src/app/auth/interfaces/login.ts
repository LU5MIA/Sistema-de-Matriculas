export interface Login {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: {
        user_id: number;
        username: string;
        email: string;
    };
}
