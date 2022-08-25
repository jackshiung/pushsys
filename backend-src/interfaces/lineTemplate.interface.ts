import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import { EnumTemplate } from "../entities/lineTemplate.entity";
import { Image } from "../utils/image.util";
import { IBaseSearchParams } from "./base.interface";
import { IImageTemplateParams, ITextTemplateParams, IVideoTemplateParams } from "./line.interface";
import { IFlexPerson, IFlexPlace, IFlexProduct, IGenerateImageCarouseTemplateResult, IImageCarouseActionTemplate } from "./lineTemplate.flex.interface";

export enum EnumSloganColorType {
    /* color: #fff;
    background-color: #666f86; */
    Info = "info",
    /* color: #666f86;
    background-color: transparent; */
    OutlineInfo = "outlineInfo",
    /* color: #fff;
    background-color: #eb4e3d; */
    Danger = "danger",
    /* color: #fff;
    background-color: #ed8537; */
    Warning = "warning",
    /* color: #fff;
    background-color: #00B900; */
    Primary = "primary",
    /* color: #fff;
    background-color: #5b82db; */
    Success = "success"
}

export enum EnumImagemapTemplate {
    ImagemapCustom = 'imagemapCustom',
    ImagemapSquare = 'imagemapSquare',
    Imagemap1x2 = 'imagemap1x2',
    Imagemap2x1 = 'imagemap2x1',
    Imagemap3x1 = 'imagemap3x1',
    Imagemap2x2 = 'imagemap2x2',
    Imagemap1n2Col = 'imagemap1n2Col',
    Imagemap1n2Row = 'imagemap1n2Row',
    Imagemap2x3 = 'imagemap2x3'
}

export enum EnumTemplateActionType {
    Message = 'message',
    Uri = 'uri',
    Postback = 'postback',
    Share = 'share',
    None = ''
}

export interface IGenerateTextTemplateParams extends IGenerateTextTemplateResult {

}

export interface IGenerateTextTemplateResult {
    content: string;
}

export interface IGenerateImageTemplateParams extends IGenerateImageTemplateResult {

}

export interface IGenerateImageTemplateResult {
    imageUrl: string;
}

export interface IGenerateImagemapAction {
    actionType: EnumTemplateActionType;
    linkUrl?: string;
    text?: string;
    area: {
        x: number;
        y: number;
        width: number;
        height: number;
    }
}

export interface IGenerateImagemapTemplateResult {
    title: string;
    imageUrl: string;
    size: Image.EnumImageSize;
    customHight?: number;
    actions: IGenerateImagemapAction[];
}

export class IImagemapTemplateBaseParams {
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;
}

export class IActionTemplate {
    @IsEnum(EnumTemplateActionType)
    @IsOptional()
    actionType?: EnumTemplateActionType;

    @IsUrl()
    @IsOptional()
    linkUrl?: string;

    @IsString()
    @IsOptional()
    text?: string;
}

export class IImagemapTemplateParams extends IImagemapTemplateBaseParams {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IActionTemplate)
    actions: IActionTemplate[];
}

export class IImagemapCustomTemplateParams extends IImagemapTemplateBaseParams {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IActionTemplate)
    actions: IActionTemplate[];
    @IsInt()
    @IsNotEmpty()
    customHight: number;
}

export class IImagemapTemplateData {
    data: IImagemapTemplateParams | IImagemapCustomTemplateParams;
}

export interface IGenerateImagemapTemplateParams extends IImagemapTemplateData {
    template: EnumTemplate;
}

export class ISloganParams {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsEnum(EnumSloganColorType)
    @IsNotEmpty()
    color: EnumSloganColorType; 
}

export class IImageCarouse {
    @IsOptional()
    slogan?: ISloganParams;    

    @IsUrl()
    @IsNotEmpty()
    imageUrl: string;

    @IsNotEmpty()
    action: IImageCarouseActionTemplate;
}

export class IImageCarouselTemplateParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    images: IImageCarouse[];
}

export class IFlexProductTemplateParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    products: IFlexProduct[];
}

export class IFlexPlaceTemplateParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    places: IFlexPlace[];
}

export class IFlexPersonTemplateParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    persons: IFlexPerson[];
}

export class ISearchLineTemplateParams extends IBaseSearchParams {
    @IsOptional()
    @IsString()
    name?: string;
}

export class ICreateLineTemplateMessage {
    @IsEnum(EnumTemplate)
    @IsNotEmpty()
    template: EnumTemplate;

    @IsNotEmpty()
    data: ITextTemplateParams |
        IImageTemplateParams |
        IImagemapTemplateParams |
        IImagemapCustomTemplateParams |
        IImageCarouselTemplateParams |
        IFlexProductTemplateParams |
        IFlexPlaceTemplateParams |
        IFlexPersonTemplateParams |
        IVideoTemplateParams
}

export class ICreateLineTemplateParams {
    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsInt()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ICreateLineTemplateMessage)
    messages: ICreateLineTemplateMessage[]
}

export interface ICreateLineTemplateResult {
    id: number;
    name: string;
    jsonData: string;
    createDate: Date;
}

export interface IGetActionTypeParams {
    actionType: EnumTemplateActionType,
    linkUrl?: string;
    text?: string;
}

export interface IGetActionTypeResult {
    actionType: EnumTemplateActionType;
    linkUrl?: string;
    text?: string;
}

export interface ITemplateMessageResult {
    template: EnumTemplate;
    data: any |
    IGenerateTextTemplateResult |
    IGenerateImageTemplateResult |
    IGenerateImagemapTemplateResult |
    IGenerateImageCarouseTemplateResult;
}

export interface ISearchLineTemplatesResult extends ICreateLineTemplateResult {
    messages: ITemplateMessageResult[];
}

export class IUpdateLineTemplateParams extends ICreateLineTemplateParams {
    @IsInt()
    @IsNotEmpty()
    templateId: number;
}

export interface IUpdateLineTemplateResult extends ICreateLineTemplateResult {
    
}

export interface IGenerateVideoTemplateParams extends IGenerateVideoTemplateResult {

}

export interface IGenerateVideoTemplateResult {
    videoUrl: string;
    imageUrl: string;
}