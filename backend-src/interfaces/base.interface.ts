import { IsInt, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class IBaseSearchParams {
    @IsOptional()
    @IsInt()
    id?: number;

    @IsOptional()
    @IsInt()
    offset?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}

export class ISearchResult<T> {
    rows: T;
    count: number;
}