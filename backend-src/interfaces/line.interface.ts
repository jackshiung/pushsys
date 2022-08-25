import {
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    Max,
    ValidateNested,
} from 'class-validator';
import LineTemplateEntity from '../entities/lineTemplate.entity';
import {
    IFlexPerson,
    IFlexPlace,
    IFlexProduct,
    IGenerateImageCarouseTemplateResult,
} from './lineTemplate.flex.interface';
import { IGenerateImagemapTemplateResult } from './lineTemplate.interface';

export class IPublishLineParams {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    userId: string;
}

export class IPublishFlexTextParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    userId?: string; //deprecation

    @IsString()
    @IsNotEmpty()
    code: string;
}

export interface IPublishFlexTextWithoutTraceParams {
    title: string;
    content: string;
    userId?: string; //deprecation
}

export class IPublishFlexImageParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}

export interface IPublishImagemapLineParams
    extends IGenerateImagemapTemplateResult {
    userId?: string;
    code: string;
    withoutTrace?: boolean;
}

export interface IPublishImageCarouselLineParams
    extends IGenerateImageCarouseTemplateResult {
    userId?: string;
    code: string;
    isShare?: boolean;
    withoutTrace?: boolean;
}

export class IPublishLineError {
    message: string;
    details: IPublishLineErrorDetail[];
}

export class IPublishLineErrorDetail {
    message: string;
    property: string;
}

export class IPublishFlexProductParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    userId?: string; //deprecation

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsArray()
    products: IFlexProduct[];

    isShare?: true;

    withoutTrace?: boolean;
}

export class IPublishFlexPlaceParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    userId?: string; //deprecation

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsArray()
    places: IFlexPlace[];

    isShare?: true;

    withoutTrace?: boolean;
}

export class IPublishFlexPersonParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    userId?: string; //deprecation

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsArray()
    persons: IFlexPerson[];

    isShare?: true;

    withoutTrace?: boolean;
}

export class ITextTemplateParams {
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class IImageTemplateParams {
    @IsString()
    @IsNotEmpty()
    imageUrl: string;
}

export class IVideoTemplateParams {
    @IsUrl()
    @IsNotEmpty()
    videoUrl: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;
}

export class IPublishLineTemplate {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    lineTemplate: LineTemplateEntity;
}

export class ILineFollowerParams {
    @IsInt()
    @Max(1000)
    @IsOptional()
    limit?: number;

    @IsString()
    @IsOptional()
    startlineId?: string;
}

export interface ILineFollowerResult {
    lineIds: string[];
    nextlineId: string;
}

export interface ILineProfileResult {
    userId: string;
    displayName: string;
    pictureUrl: string;
    language: string;
}
