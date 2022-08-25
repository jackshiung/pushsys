import { Inject, Service } from "typedi";
import LineTemplateEntity from "../entities/lineTemplate.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { IPublishImagemapLineParams } from "../interfaces/line.interface";
import { EnumImagemapTemplate, EnumTemplateActionType, IGenerateImagemapTemplateParams, IGenerateImagemapTemplateResult, IGetActionTypeParams, IGetActionTypeResult, IImageCarouse, IImagemapCustomTemplateParams, IImagemapTemplateParams, IGenerateImagemapAction } from "../interfaces/lineTemplate.interface";
import { Format } from "../utils/format.util";
import { Image } from "../utils/image.util";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { BaseService } from "./base.lib.svc";

@Service()
export class LineTemplateImagemapLibSvc extends BaseService<LineTemplateEntity>{
    async findOneOrError(): Promise<LineTemplateEntity> {
        throw new AppError({ message: '未實作 findOneOrError', code: ResultCode.serverError }) 
    }

    async search(): Promise<ISearchResult<LineTemplateEntity[]>> {
        throw new AppError({ message: '未實作 search', code: ResultCode.serverError }) 
    }

    async generateImagemapMessage(params: IPublishImagemapLineParams) {
        const messages = [{
            type: "imagemap",
            baseUrl: `${params.imageUrl}?`,
            altText: params.title,
            baseSize: {
                "width": params.size,
                "height": params.customHight ?? params.size,
            },
            actions: Format.setImagemapActionLinkUri(params.actions, params.code)
        }];

        return messages;
    }

    async generateImagemapMessageWithoutTrace(params: IPublishImagemapLineParams) {
        const messages = [{
            type: "imagemap",
            baseUrl: `${params.imageUrl}?`,
            altText: params.title,
            baseSize: {
                "width": params.size,
                "height": params.customHight ?? params.size,
            },
            actions: Format.setImagemapActionLinkUri(params.actions, params.code, params.withoutTrace)
        }];

        return messages;
    }

    async generateImagemapTemplate(params: IGenerateImagemapTemplateParams) {
        let imagemap: any = {};
        switch (params.template.toString()) {
            case EnumImagemapTemplate.ImagemapSquare:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemapSquareTemplate(params.data);
                break;
            case EnumImagemapTemplate.ImagemapCustom:
                await this.validateObject(IImagemapCustomTemplateParams, params.data);
                imagemap = this.generateImagemapCustomTemplate(<IImagemapCustomTemplateParams>params.data);
                break;
            case EnumImagemapTemplate.Imagemap1x2:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap1X2Template(params.data);
                break;
            case EnumImagemapTemplate.Imagemap2x1:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap2x1Template(params.data);
                break;
            case EnumImagemapTemplate.Imagemap3x1:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap3x1Template(params.data);
                break;
            case EnumImagemapTemplate.Imagemap2x2:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap2x2Template(params.data);
                break;
            case EnumImagemapTemplate.Imagemap1n2Col:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap1n2ColTemplate(params.data);
                break;
            case EnumImagemapTemplate.Imagemap1n2Row:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap1n2RowTemplate(params.data);
                break;
            case EnumImagemapTemplate.Imagemap2x3:
                await this.validateObject(IImagemapTemplateParams, params.data);
                imagemap = this.generateImagemap2x3Template(params.data);
                break;
        }
        return imagemap;
    }

    generateImagemapSquareTemplate(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 1) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: 1040
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    generateImagemapCustomTemplate(data: IImagemapCustomTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 1) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.customHight > 2080) {
            throw new AppError({ message: 'customHight error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: data.customHight
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            customHight: data.customHight,
            actions
        }
        return imagemap;
    }

    generateImagemap1n2ColTemplate(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 3) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: 520
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 0,
                    y: 520,
                    width: 520,
                    height: 520
                }
            })
        }
        if (data.actions[2].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[2].actionType,
                    linkUrl: data.actions[2].linkUrl,
                    text: data.actions[2].text
                }),
                area: {
                    x: 520,
                    y: 520,
                    width: 520,
                    height: 520
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions
        }
        return imagemap;
    }

    generateImagemap1n2RowTemplate(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 3) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: 520
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 0,
                    y: 520,
                    width: 1040,
                    height: 260
                }
            })
        }
        if (data.actions[2].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[2].actionType,
                    linkUrl: data.actions[2].linkUrl,
                    text: data.actions[2].text
                }),
                area: {
                    x: 0,
                    y: 780,
                    width: 1040,
                    height: 260
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions
        }
        return imagemap;
    }

    generateImagemap2x1Template(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 2) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: 520
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 0,
                    y: 520,
                    width: 1040,
                    height: 520
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    generateImagemap1X2Template(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 2) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 1040
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 520,
                    y: 0,
                    width: 520,
                    height: 1040
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    generateImagemap3x1Template(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 3) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 1040,
                    height: 346
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 0,
                    y: 346,
                    width: 1040,
                    height: 346
                }
            })
        }
        if (data.actions[2].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[2].actionType,
                    linkUrl: data.actions[2].linkUrl,
                    text: data.actions[2].text
                }),
                area: {
                    x: 0,
                    y: 692,
                    width: 1040,
                    height: 346
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    generateImagemap2x2Template(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 4) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 520
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 520,
                    y: 0,
                    width: 520,
                    height: 520
                }
            })
        }
        if (data.actions[2].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[2].actionType,
                    linkUrl: data.actions[2].linkUrl,
                    text: data.actions[2].text
                }),
                area: {
                    x: 0,
                    y: 520,
                    width: 520,
                    height: 520
                }
            })
        }
        if (data.actions[3].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[3].actionType,
                    linkUrl: data.actions[3].linkUrl,
                    text: data.actions[3].text
                }),
                area: {
                    x: 520,
                    y: 520,
                    width: 520,
                    height: 520
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    generateImagemap2x3Template(data: IImagemapTemplateParams): IGenerateImagemapTemplateResult {
        const actions: IGenerateImagemapAction[] = [];
        if (data.actions.length != 6) {
            throw new AppError({ message: 'action error', code: ResultCode.clientError })
        }
        if (data.actions[0].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[0].actionType,
                    linkUrl: data.actions[0].linkUrl,
                    text: data.actions[0].text
                }),
                area: {
                    x: 0,
                    y: 0,
                    width: 346,
                    height: 520
                }
            })
        }
        if (data.actions[1].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[1].actionType,
                    linkUrl: data.actions[1].linkUrl,
                    text: data.actions[1].text
                }),
                area: {
                    x: 346,
                    y: 0,
                    width: 346,
                    height: 520
                }
            })
        }
        if (data.actions[2].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[2].actionType,
                    linkUrl: data.actions[2].linkUrl,
                    text: data.actions[2].text
                }),
                area: {
                    x: 692,
                    y: 0,
                    width: 346,
                    height: 520
                }
            })
        }
        if (data.actions[3].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[3].actionType,
                    linkUrl: data.actions[3].linkUrl,
                    text: data.actions[3].text
                }),
                area: {
                    x: 0,
                    y: 520,
                    width: 346,
                    height: 520
                }
            })
        }
        if (data.actions[4].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[4].actionType,
                    linkUrl: data.actions[4].linkUrl,
                    text: data.actions[4].text
                }),
                area: {
                    x: 346,
                    y: 520,
                    width: 346,
                    height: 520
                }
            })
        }
        if (data.actions[5].actionType) {
            actions.push({
                ...this.getActionType({
                    actionType: data.actions[5].actionType,
                    linkUrl: data.actions[5].linkUrl,
                    text: data.actions[5].text
                }),
                area: {
                    x: 692,
                    y: 520,
                    width: 346,
                    height: 520
                }
            })
        }

        const imagemap: IGenerateImagemapTemplateResult = {
            title: data.title,
            imageUrl: data.imageUrl,
            size: Image.EnumImageSize.px1040,
            actions,
        }
        return imagemap;
    }

    private getActionType(params: IGetActionTypeParams): IGetActionTypeResult {
        switch (params.actionType) {
            case EnumTemplateActionType.Message:
                return {
                    actionType: EnumTemplateActionType.Message,
                    text: params.text,
                };
            case EnumTemplateActionType.Uri:
                return {
                    actionType: EnumTemplateActionType.Uri,
                    linkUrl: params.linkUrl,
                };
            default:
                throw new AppError({
                    message: 'ActionType error',
                    code: ResultCode.clientError,
                });
        }
    }
}