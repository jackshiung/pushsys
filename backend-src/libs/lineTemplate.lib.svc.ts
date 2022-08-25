import { typeChecker } from "camel-toolbox";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import LineTemplateEntity, { EnumTemplate } from "../entities/lineTemplate.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { EnumTemplateActionType, ICreateLineTemplateMessage, ICreateLineTemplateParams, ICreateLineTemplateResult, IFlexPersonTemplateParams, IFlexPlaceTemplateParams, IFlexProductTemplateParams, IGenerateImagemapTemplateResult, IGenerateImageTemplateResult, IGenerateTextTemplateResult, IGenerateVideoTemplateResult, IImageCarouselTemplateParams, IImagemapCustomTemplateParams, IImagemapTemplateParams, ISearchLineTemplateParams, ISearchLineTemplatesResult, ITemplateMessageResult, IUpdateLineTemplateParams, IUpdateLineTemplateResult } from "../interfaces/lineTemplate.interface";
import { LineTemplateRepository } from "../repositories/lineTemplate.repo";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { BaseService } from "./base.lib.svc";
import { LineTemplateImagemapLibSvc } from "./lineTemplate.imagemap.lib.svc";
import { Like } from "typeorm";
import { LineTemplateFlexLibSvc } from "./lineTempldate.flex.lib.svc";
import { IGenerateFlexPersonTemplateResult, IGenerateFlexPlaceTemplateResult, IGenerateFlexProductTemplateResult, IGenerateImageCarouseTemplateResult } from "../interfaces/lineTemplate.flex.interface";
import { IImageTemplateParams, ITextTemplateParams, IVideoTemplateParams } from "../interfaces/line.interface";

@Service()
export class LineTemplateLibSvc extends BaseService<LineTemplateEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly lineTemplateRepository: LineTemplateRepository;
    @Inject()
    private lineTemplateImagemapLibSvc: LineTemplateImagemapLibSvc;
    @Inject()
    private lineTemplateFlexLibSvc: LineTemplateFlexLibSvc;

    async findOneOrError(id: number): Promise<LineTemplateEntity> {
        const lineTemplate = await this.lineTemplateRepository.findOne({
            id,
            isDeleted: false
        })
        if (typeChecker.isNullOrUndefinedObject(lineTemplate)) {
            throw new AppError({ message: '查無此樣板', code: ResultCode.clientError })
        }
        return lineTemplate;
    }

    async search(params: ISearchLineTemplateParams): Promise<ISearchResult<LineTemplateEntity[]>> {
        const filters: any = {};
        filters.isDeleted = false;
        if (params.id) {
            filters.id = params.id;
        }
        if (params.name) {
            filters.name = Like(`%${params.name}%`);
        }

        const [lineTemplates, count] = await this.lineTemplateRepository.findAndCount({
            where: filters,
            order: {
                id: "DESC"
            },
            skip: params.offset,
            take: params.limit
        });

        return {
            rows: lineTemplates,
            count
        }
    }

    async delete(lineTemplateId: number) {
        const lineTemplate = await this.findOneOrError(lineTemplateId);
        lineTemplate.isDeleted = true;

        return await this.lineTemplateRepository.save(lineTemplate);
    }

    async createTemplates(params: ICreateLineTemplateParams): Promise<ICreateLineTemplateResult> {
        const templateData = await this.generateTemplateData(params.messages);

        const lineTemplate = new LineTemplateEntity();
        lineTemplate.companyId = params.companyId;
        lineTemplate.name = params.name;
        lineTemplate.template = EnumTemplate.None;
        lineTemplate.data = JSON.stringify(templateData);

        const newLineTemplate = await this.lineTemplateRepository.save(lineTemplate);

        return {
            id: newLineTemplate.id,
            name: newLineTemplate.name,
            jsonData: lineTemplate.data,
            createDate: lineTemplate.createDate
        };
    }

    async updateTemplates(params: IUpdateLineTemplateParams): Promise<IUpdateLineTemplateResult> {
        const template = await this.findOneOrError(params.templateId);
        const templateData = await this.generateTemplateData(params.messages);

        template.name = params.name;
        template.data = JSON.stringify(templateData);

        const updateLineTemplate = await this.lineTemplateRepository.save(template);

        return {
            id: updateLineTemplate.id,
            name: updateLineTemplate.name,
            jsonData: updateLineTemplate.data,
            createDate: updateLineTemplate.createDate
        };
    }

    async generateTemplateData(messages: ICreateLineTemplateMessage[]): Promise<any[]> {
        const templateData: any[] = [];
        let includingImagemap = false;
        let includingShare = false;

        for (const message of messages) {
            switch (message.template) {
                case EnumTemplate.Text:
                    const textData = <ITextTemplateParams>message.data;
                    await this.validateObject(ITextTemplateParams, textData);
                    templateData.push({
                        template: message.template,
                        data: textData
                    });
                    break;
                case EnumTemplate.Image:
                    const imageData = <IImageTemplateParams>message.data;
                    await this.validateObject(IImageTemplateParams, imageData);
                    templateData.push({
                        template: message.template,
                        data: imageData
                    });
                    break;
                case EnumTemplate.ImagemapSquare:
                case EnumTemplate.ImagemapCustom:
                case EnumTemplate.Imagemap1x2:
                case EnumTemplate.Imagemap2x1:
                case EnumTemplate.Imagemap3x1:
                case EnumTemplate.Imagemap2x2:
                case EnumTemplate.Imagemap1n2Col:
                case EnumTemplate.Imagemap1n2Row:
                case EnumTemplate.Imagemap2x3:
                    includingImagemap = true;
                    templateData.push({
                        template: message.template,
                        data: await this.lineTemplateImagemapLibSvc.generateImagemapTemplate({
                            template: message.template,
                            data: <any>(message.data)
                        })
                    });
                    break;
                case EnumTemplate.ImageCarousel:
                    const imageCarouselData = <IImageCarouselTemplateParams>message.data;
                    await this.validateObject(IImageCarouselTemplateParams, imageCarouselData);
                    if (
                        imageCarouselData.images.some(
                            (data) =>
                                data.action.actionType ==
                                EnumTemplateActionType.Share
                        )
                    ) {
                        includingShare = true;
                    }
                    templateData.push({
                        template: message.template,
                        title: imageCarouselData.title,
                        data: await this.lineTemplateFlexLibSvc.generateImageCarouselTemplate({
                            ...imageCarouselData
                        })
                    });
                    break;
                case EnumTemplate.CardtypeProduct:
                    const flexProductData = <IFlexProductTemplateParams>message.data;
                    await this.validateObject(IFlexProductTemplateParams, flexProductData);
                    if (
                        flexProductData.products.some(
                            (data) =>
                                data.button.some(
                                    (btn) =>
                                        btn.action.actionType ==
                                        EnumTemplateActionType.Share
                                ) == true
                        )
                    ) {
                        includingShare = true;
                    }
                    
                    templateData.push({
                        template: message.template,
                        title: flexProductData.title,
                        data: await this.lineTemplateFlexLibSvc.generateFlexProductTemplate({
                            ...flexProductData
                        })
                    });
                    break;
                case EnumTemplate.CardtypePlace:
                    const flexPlaceData = <IFlexPlaceTemplateParams>message.data;
                    await this.validateObject(IFlexPlaceTemplateParams, flexPlaceData);
                    if (
                        flexPlaceData.places.some(
                            (data) =>
                                data.button.some(
                                    (btn) =>
                                        btn.action.actionType ==
                                        EnumTemplateActionType.Share
                                ) == true
                        )
                    ) {
                        includingShare = true;
                    }
                    
                    templateData.push({
                        template: message.template,
                        title: flexPlaceData.title,
                        data: await this.lineTemplateFlexLibSvc.generateFlexPlaceTemplate({
                            ...flexPlaceData
                        })
                    });
                    break;
                case EnumTemplate.CardtypePerson:
                    const flexPersonData = <IFlexPersonTemplateParams>message.data;
                    await this.validateObject(IFlexPersonTemplateParams, flexPersonData);
                    if (
                        flexPersonData.persons.some(
                            (data) =>
                                data.button.some(
                                    (btn) =>
                                        btn.action.actionType ==
                                        EnumTemplateActionType.Share
                                ) == true
                        )
                    ) {
                        includingShare = true;
                    }
                    
                    templateData.push({
                        template: message.template,
                        title: flexPersonData.title,
                        data: await this.lineTemplateFlexLibSvc.generateFlexPersonTemplate({
                            ...flexPersonData
                        })
                    });
                    break;
                case EnumTemplate.Video:
                    const videoData = <IVideoTemplateParams>message.data;
                    await this.validateObject(IVideoTemplateParams, videoData);
                    if (!videoData.imageUrl) {
                        let imageUrl = 'https://jjdigi.sfo2.cdn.digitaloceanspaces.com/crosschannel/default/VIDEO_DEFAULT.png';
                        videoData.imageUrl = imageUrl;
                    }
                    templateData.push({
                        template: message.template,
                        data: videoData
                    });
                    break;
            }
        }

        //share不支援imagemap
        if (includingImagemap && includingShare) {
            throw new AppError({ message: '若有圖文訊息則無法使用"分享"功能', code: ResultCode.clientError });
        }
        
        return templateData;
    }

    async generateResult(template: LineTemplateEntity): Promise<ISearchLineTemplatesResult> {
        let res: ITemplateMessageResult[] = [];
        const lineTemplates = JSON.parse(template.data);
        for (const lineTemplate of lineTemplates) {
            switch (lineTemplate.template) {
                case EnumTemplate.Text:
                    {
                        const data: IGenerateTextTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.Image:
                    {
                        const data: IGenerateImageTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.ImagemapSquare:
                case EnumTemplate.Imagemap1x2:
                case EnumTemplate.Imagemap2x1:
                case EnumTemplate.Imagemap3x1:
                case EnumTemplate.Imagemap2x2:
                case EnumTemplate.Imagemap1n2Col:
                case EnumTemplate.Imagemap1n2Row:
                case EnumTemplate.Imagemap2x3:
                    {
                        const data: IImagemapTemplateParams = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.ImagemapCustom:
                    {
                        const data: IImagemapCustomTemplateParams = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.ImageCarousel:
                    {
                        const data: IGenerateImageCarouseTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.CardtypeProduct:
                    {
                        const data: IGenerateFlexProductTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.CardtypePlace:
                    {
                        const data: IGenerateFlexPlaceTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.CardtypePerson:
                    {
                        const data: IGenerateFlexPersonTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
                case EnumTemplate.Video:
                    {
                        const data: IGenerateVideoTemplateResult = lineTemplate.data;
                        res = res.concat({
                            template: lineTemplate.template,
                            data
                        });
                    } break;
            }
        }
        return {
            id: template.id,
            name: template.name,
            jsonData: template.data,
            createDate: template.createDate,
            messages: res
        }
    }
}