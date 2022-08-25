import { IsNotEmpty } from 'class-validator';
import { IsInt, IsOptional, IsString } from 'class-validator';
export class ISearchUserParams {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    account?: string;
}

export class IUserPayload {
    @IsNotEmpty()
    @IsInt()
    userId: number;

    @IsNotEmpty()
    @IsString()
    apiKey: string;
}

export class IUpdateUserParams {
    @IsNotEmpty()
    @IsInt()
    id: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    account?: string;

    @IsOptional()
    @IsString()
    password?: string;
}

export interface IUpdateUserResult {
    id: number;
}