import { IsNotEmpty, IsString } from 'class-validator';
import { APIListResult, APIResult } from './../models/network.model';
import { axiosInstance } from './network';
export class TemplateSvc {
    /**
     * 取得樣板列表
     * @path [GET] /api/v1/management/template/line?p=1&ps=10
     */
    async getTemplates(param: GetTemplatesParameter): Promise<APIListResult<Template>> {
        const response = await axiosInstance.get<APIListResult<Template>>('/management/template/line', {
            params: {
                ps: param.size,
                p: param.index,
                name: param?.name ?? ""
            }
        });

        return response.data
    }

    /**
    * 刪除樣板
    * @path [GET] /api/v1/management/template/line/:id
    */
    async deleteTemplate(id: string): Promise<APIResult<Template>> {
        const response = await axiosInstance.delete<APIListResult<Template>>(`/management/template/line/${id}`);
        return response.data
    }

    /**
     * 新增樣板
     * @path /api/v1/management/template/line/create
     */
    async createTemplate(param: CreateTemplateWithMessagesParameter): Promise<APIResult<TemplateWithMessages>> {
        const response = await axiosInstance.post<APIResult<TemplateWithMessages>>(`/management/template/line/create`, param);
        return response.data;
    }


    /**
     * 取得樣板
     * @path /api/v1/management/template/line/:id
     */
    async getTemplate(id: string): Promise<APIResult<ISearchLineTemplatesResult>> {
        const response = await axiosInstance.get<APIResult<ISearchLineTemplatesResult>>(`/management/template/line/${id}`);
        return response.data;
    }

    /**
    * 更新樣板
    * @path /api/v1/management/template/line/update/:id
    */
    async updateTemplate(id: string, param: CreateTemplateWithMessagesParameter): Promise<APIResult<TemplateWithMessages>> {
        const response = await axiosInstance.put<APIResult<TemplateWithMessages>>(`/management/template/line/update/${id}`, param)
        return response.data
    }


}

export interface GetTemplatesParameter {
    index: number
    size: number
    name?: string
}

export enum EnumTemplate {

    None = 'none',
    Text = 'text',
    Image = 'image',
    ImagemapCustom = 'imagemapCustom',
    ImagemapSquare = 'imagemapSquare',
    Imagemap1x2 = 'imagemap1x2',
    Imagemap2x1 = 'imagemap2x1',
    Imagemap3x1 = 'imagemap3x1',
    Imagemap2x2 = 'imagemap2x2',
    Imagemap1n2Col = 'imagemap1n2Col',
    Imagemap1n2Row = 'imagemap1n2Row',
    Imagemap2x3 = 'imagemap2x3',
    ImageCarousel = 'imageCarousel',
    CardtypeProduct = 'cardtypeProduct',
    CardtypePlace = 'cardtypePlace',
    CardtypePerson = 'cardtypePerson',
    Video = 'video'
}

export interface Template {
    id: number;
    companyId: number;
    name: string;
    template: EnumTemplate;
    data: string;
    isDeleted: boolean;
    createDate: Date;
    updateDate: Date;
    company?: CompanyEntity;
}


export interface CompanyEntity {
    id: number;
    name: string;
    isDeleted: boolean;
    createDate: Date;
    updateDate: Date;
}

export interface TemplateWithMessages {
    id: number;
    name: string;
    jsonData: string;
    createDate: Date;
}

export type ICreateLineTemplateResult = TemplateWithMessages

export class CreateTemplateWithMessagesParameter {
    @IsString()
    name: string;
    messages: TemplateMessage[]
}

export interface TemplateMessage {
    template: EnumTemplate
    data: TemplateMessageData
}

export type TemplateMessageData = ITextTemplateParams | IImageTemplateParams | IImagemapTemplateParams
    | IImageCarouselTemplateParams | IFlexPersonTemplateParams | IFlexPlaceTemplateParams | IFlexProductTemplateParams | IVideoTemplateParams


export class ITextTemplateParams {
    content: string;
}

export class IImageTemplateParams {
    imageUrl: string;
}

export class IImagemapTemplateParams {

    title: string;
    imageUrl: string;
    actions: IActionTemplate[];
    customHight: number;
}

export class IImageCarouselTemplateParams {
    title: string;
    images: IImageCarousel[];
}

export class IActionTemplate {
    actionType?: EnumTemplateActionType;
    linkUrl?: string;

    text?: string;
}

export enum EnumTemplateActionType {
    Message = 'message',
    Uri = 'uri',
    Empty = '',
    Share = 'share'
}

export interface ISearchLineTemplatesResult extends ICreateLineTemplateResult {
    messages: ITemplateMessageResult[];
}

export interface ITemplateMessageResult {
    template: EnumTemplate;
    data: any |
    IGenerateTextTemplateResult |
    IGenerateImageTemplateResult |
    IGenerateImagemapTemplateResult |
    IGenerateImageCarouseTemplateResult |
    IFlexPersonTemplateParams |
    IFlexProductTemplateParams |
    IFlexPlaceTemplateParams;
}

export interface IGenerateTextTemplateResult {
    content: string;
}

export interface IGenerateImageTemplateResult {
    imageUrl: string;
}

export interface ImagemapAction {
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
    size: EnumImageSize;
    customHight?: number;
    actions: ImagemapAction[];
}

export interface IGenerateImageCarouseTemplateResult {
    title: string;
    images: IImageCarousel[];
}

export enum EnumImageSize {
    px1040 = 1040,
    px700 = 700,
    px460 = 460,
    px300 = 300,
    px240 = 240,
    custom = 0
}

export interface IImageCarousel {
    imageUrl: string;
    action?: IImageCarouseActionTemplate;
    slogan?: ISloganParams;
}


export class IImageCarouseActionTemplate {
    actionType?: EnumTemplateActionType;
    linkUrl?: string;
    text?: string;
    label?: string;
}

export class IFlexPersonTemplateParams {
    title: string;
    persons: IFlexPerson[];
}


export class IFlexPerson {
    imageUrl: string;
    personName: string;
    description?: string;
    button?: IFlexTemplateButtonParams[];
}

export class IFlexTemplateButtonParams {
    name: string;
    action?: IActionTemplate;
}

export class IFlexProductTemplateParams {
    title: string;
    products: IFlexProduct[];
}

export class IFlexProduct {
    imageUrl: string;
    title: string;
    price?: number;
    description?: string;
    button?: IFlexTemplateButtonParams[];
}

export class IFlexPlaceTemplateParams {
    title: string;
    places: IFlexPlace[];
}

export class IFlexPlace {
    imageUrl: string;
    title: string;
    address?: string;
    info?: IFlexPlaceInfoTemplate;
    button?: IFlexTemplateButtonParams[];
}

export class IFlexPlaceInfoTemplate {

    infoType: EnumFlexPlaceInfoType;
    date?: string;
    price?: number;
}

export enum EnumFlexPlaceInfoType {
    Date = 'date',
    Price = 'price'
}

export enum EnumSloganColorType {
    // color: #ffffff; background-color: #666f86;
    Info = "info",

    // color: #666f86; background-color: #ffffff;
    OutlineInfo = "outlineInfo",

    // color: #ffffff; background-color: #eb4e3d;
    Danger = "danger",

    // color: #ffffff; background-color: #ed8537;
    Warning = "warning",

    // color: #ffffff; background-color: #00B900;
    Primary = "primary",

    // color: #ffffff; background-color: #5b82db;
    Success = "success"
}

export class ISloganParams {
    text: string;
    color: EnumSloganColorType;
}

export class IVideoTemplateParams {
    videoUrl: string;
    imageUrl?: string;
}