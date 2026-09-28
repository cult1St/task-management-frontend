export interface LoginDTO{
    email:string;
    password:string;
}

export interface RegisterDTO{
    fullName: string;
    email: string;
    password: string;
}

export interface ValidationErrors{
    [name: string]: string | undefined | null;
}

export interface ErrorResponse{
    message: string;
    errors?: ValidationErrors;
    /** Machine-readable code, e.g. EMAIL_NOT_VERIFIED */
    code?: string;
}
