import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { EnumTemplateActionType, IActionTemplate, IImageCarouse, IImageCarouselTemplateParams } from "./lineTemplate.interface";

export interface FlexAction {
    type: EnumTemplateActionType;
    uri?: string;
    text?: string;
    label?: string;
}

export interface IGenerateImageCarouseTemplateParams extends IGenerateImageCarouseTemplateResult {

}

export interface IGenerateImageCarouseTemplateResult {
    title: string;
    images: IImageCarouse[];
}

export class IImageCarouseActionTemplate {
    @IsEnum(EnumTemplateActionType)
    @IsOptional()
    actionType?: EnumTemplateActionType;

    @IsUrl()
    @IsOptional()
    linkUrl?: string;

    @IsString()
    @IsOptional()
    text?: string;

    @IsString()
    @IsOptional()
    label?: string;
}

//

export interface IGenerateFlexProductTemplateParams extends IGenerateFlexProductTemplateResult {

}

export interface IGenerateFlexProductTemplateResult {
    title: string;
    products: IFlexProduct[];
}

export interface IGenerateFlexPlaceTemplateParams extends IGenerateFlexPlaceTemplateResult {

}

export interface IGenerateFlexPlaceTemplateResult {
    title: string;
    places: IFlexPlace[];
}

export interface IGenerateFlexPersonTemplateParams extends IGenerateFlexPersonTemplateResult {

}

export interface IGenerateFlexPersonTemplateResult {
    title: string;
    persons: IFlexPerson[];
}

export class IFlexButton {
    type: string = "button";
    style: string = "link";
    height: string = "sm";
    action: {
        type: string,
        label: string,
        uri: string
    }
}

export class IFlexTemplateButtonParams {
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => IActionTemplate)
    @IsOptional()
    action?: IActionTemplate;
}

export class IFlexProduct {
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IFlexTemplateButtonParams)
    @IsOptional()
    button?: IFlexTemplateButtonParams[];
}

export enum EnumFlexPlaceInfoType {
    Date = 'date',
    Price = 'price'
}

export class IFlexPlaceInfoTemplate {
    @IsEnum(EnumFlexPlaceInfoType)
    @IsNotEmpty()
    infoType: EnumFlexPlaceInfoType;

    @IsString()
    @IsOptional()
    date?: string;

    @IsNumber()
    @IsOptional()
    price?: number;
}

export class IFlexPlace {
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    address?: string;

    @ValidateNested({ each: true })
    @Type(() => IFlexTemplateButtonParams)
    @IsOptional()
    info?: IFlexPlaceInfoTemplate;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IFlexTemplateButtonParams)
    @IsOptional()
    button?: IFlexTemplateButtonParams[];
}

export class IFlexPerson {
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;

    @IsString()
    @IsNotEmpty()
    personName?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IFlexTemplateButtonParams)
    @IsOptional()
    button?: IFlexTemplateButtonParams[];
}