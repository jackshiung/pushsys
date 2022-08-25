import { Inject, Service } from "typedi";
import { IImageTemplateParams, IPublishFlexImageParams, IPublishFlexPersonParams, IPublishFlexPlaceParams, IPublishFlexProductParams, IPublishFlexTextParams, IPublishFlexTextWithoutTraceParams, IPublishImageCarouselLineParams, IVideoTemplateParams } from "../interfaces/line.interface";
import { config } from "../configuration";
import { Format } from "../utils/format.util";
import { EnumSloganColorType, EnumTemplateActionType, IGetActionTypeParams, IGetActionTypeResult, IImageCarouse } from "../interfaces/lineTemplate.interface";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { EnumFlexPlaceInfoType, IFlexPerson, IFlexPlace, IFlexProduct, IFlexTemplateButtonParams, IGenerateFlexPersonTemplateParams, IGenerateFlexPersonTemplateResult, IGenerateFlexPlaceTemplateParams, IGenerateFlexPlaceTemplateResult, IGenerateFlexProductTemplateParams, IGenerateFlexProductTemplateResult, IGenerateImageCarouseTemplateParams, IGenerateImageCarouseTemplateResult } from "../interfaces/lineTemplate.flex.interface";

@Service()
export class LineTemplateFlexLibSvc {
    async generateFlexText(params: IPublishFlexTextParams) {
        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "bubble",
                header: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        wrap: true,
                        text: `${params.content}`
                    }, {
                        type: "image",
                        url: `${config.hookHost}/hook/line/read/${params.code}`,
                        size: "1px"
                    }]
                }
            }
        }];

        return messages;
    }

    async generateFlexTextWithoutTrace(params: IPublishFlexTextWithoutTraceParams) {
        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "bubble",
                header: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        wrap: true,
                        text: `${params.content}`
                    }]
                }
            }
        }];

        return messages;
    }

    async generateFlexImageMessage(params: IPublishFlexImageParams) {
        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "bubble",
                hero: {
                    type: "image",
                    url: params.url,
                    size: "full",
                    aspectMode: "cover"
                },
                footer: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "image",
                        url: `${config.hookHost}/hook/line/read/${params.code}`,
                        size: "0px"
                    }],
                    paddingAll: "0px"
                }
            }
        }];

        return messages;
    }

    async generateImageCarouselTemplate(params: IGenerateImageCarouseTemplateParams): Promise<IGenerateImageCarouseTemplateResult> {
        const imageColumns: IImageCarouse[] = [];
        if (params.images.length > 9) {
            throw new AppError({ message: 'images max 9 pages', code: ResultCode.clientError });
        }
        for (const image of params.images) {
            if (image.action.actionType == EnumTemplateActionType.None || !image.action.actionType) {
                imageColumns.push({
                    slogan: image.slogan,
                    imageUrl: image.imageUrl,
                    action: image.action
                })
                continue;
            }

            let tmpAction: any = {
                ...this.getActionType({
                    actionType: image.action.actionType,
                    linkUrl: image.action.linkUrl,
                    text: image.action.text,
                })
            }
            if (image.action.label) {
                tmpAction.label = image.action.label;
            }

            imageColumns.push({
                slogan: image.slogan,
                imageUrl: image.imageUrl,
                action: tmpAction
            })
        }

        return {
            title: params.title,
            images: imageColumns
        };
    }

    async generateImageCarouselMessage(params: IPublishImageCarouselLineParams) {
        const imageColumns: any[] = [];

        params.images.forEach(data => {
            const heroContents: any[] = [{
                type: "image",
                size: "full",
                url: data.imageUrl,
                //TODO: label not display
                action: Format.setFlexActionLinkUri({
                    type: data.action.actionType,
                    uri: data.action.linkUrl,
                    text: data.action.text,
                    label: data.action.label
                }, params.code, params.isShare, params.withoutTrace)
            }];
            if (data.slogan) {
                const { textColor, backgroundColor } = this.getColor(data.slogan.color);
                heroContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: [
                        {
                            type: "text",
                            text: data.slogan.text,
                            size: "md",
                            color: textColor
                        }
                    ],
                    position: "absolute",
                    backgroundColor: backgroundColor,
                    borderWidth: "semi-bold",
                    cornerRadius: "20px",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingStart: "lg",
                    paddingEnd: "lg",
                    offsetStart: "xl",
                    offsetTop: "lg"
                })
            }
            if (data.action.label) {
                heroContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: [
                      {
                        type: "text",
                        text: data.action.label,
                        color: "#ffffff",
                        size: "md"
                      }
                    ],
                    position: "absolute",
                    backgroundColor: "#8e8f91AA",
                    borderWidth: "semi-bold",
                    cornerRadius: "20px",
                    offsetBottom: "10%",
                    paddingTop: "1%",
                    paddingBottom: "2%",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingStart: "5%",
                    paddingEnd: "5%",
                    offsetEnd: "20%",
                    offsetStart: "20%"
                  });
            }
            imageColumns.push({
                type: "bubble",
                hero: {
                    type: "box",
                    layout: "vertical",
                    contents: heroContents
                }
            })
        })

        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "carousel",
                contents: imageColumns
            }
        }];

        console.log(JSON.stringify(messages))

        return messages;
    }

    async generateFlexProductTemplate(data: IGenerateFlexProductTemplateParams): Promise<IGenerateFlexProductTemplateResult> {
        const productColumns: IFlexProduct[] = [];
        if (data.products.length > 9) {
            throw new AppError({ message: 'products max 9 pages', code: ResultCode.clientError });
        }

        for (const product of data.products) {
            const flexButtons: IFlexTemplateButtonParams[] = [];
            if (product.button) {
                for (const button of product.button) {
                    if (button.action) {
                        flexButtons.push({
                            name: button.name,
                            action: {
                                actionType: button.action.actionType,
                                ...this.getActionType({
                                    actionType: button.action.actionType,
                                    linkUrl: button.action.linkUrl,
                                    text: button.action.text,
                                })
                            }
                        })
                    }
                }
                productColumns.push({
                    ...product,
                    button: flexButtons
                });

            } else {
                productColumns.push({
                    ...product
                });
            }
        }

        return {
            title: data.title,
            products: productColumns
        };
    }

    async generateFlexProductMessage(params: IPublishFlexProductParams) {
        const contents: any[] = [];
        for (const product of params.products) {
            let content: any = {
                type: "bubble",
                size: "giga",
                hero: {
                    type: "image",
                    url: product.imageUrl,
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover"
                }
            };

            let bodyContents: any[] = [{
                type: "text",
                text: product.title,
                weight: "bold",
                size: "xl",
                contents: [{
                    type: "span",
                    text: product.title,
                }]
            }];
            if (product.price) {
                bodyContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        text: `NT $${Format.toCurrency(product.price)}`,
                        wrap: true,
                        size: "sm",
                        align: "end"
                    }]
                })
            }
            if (product.description) {
                bodyContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        text: product.description,
                        wrap: true,
                        size: "sm"
                    }]
                })
            }
            content.body = {
                type: "box",
                layout: "vertical",
                contents: bodyContents
            }
            if (product.button) {
                const footerContents: any[] = [];
                for (const button of product.button) {
                    if (!button.action) {
                        continue;
                    }
                    footerContents.push({
                        type: "button",
                        style: "link",
                        height: "sm",
                        action: Format.setFlexActionLinkUri({
                            type: button.action.actionType,
                            uri: button.action.linkUrl,
                            text: button.action.text,
                            label: button.name
                        },  params.code, params.isShare, params.withoutTrace)
                    })
                }
                content.footer = {
                    type: "box",
                    layout: "vertical",
                    spacing: "sm",
                    contents: footerContents,
                    flex: 0
                }
            }
            contents.push(content)
        }

        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "carousel",
                contents: contents
            }
        }];

        return messages;
    }

    async generateFlexPlaceTemplate(data: IGenerateFlexPlaceTemplateParams): Promise<IGenerateFlexPlaceTemplateResult> {
        const placeColumns: IFlexPlace[] = [];
        if (data.places.length > 9) {
            throw new AppError({ message: 'places max 9 pages', code: ResultCode.clientError });
        }

        for (const place of data.places) {
            const flexButtons: IFlexTemplateButtonParams[] = [];
            if (place.button) {
                for (const button of place.button) {
                    if (button.action) {
                        flexButtons.push({
                            name: button.name,
                            action: {
                                actionType: button.action.actionType,
                                ...this.getActionType({
                                    actionType: button.action.actionType,
                                    linkUrl: button.action.linkUrl,
                                    text: button.action.text,
                                })
                            }
                        })
                    }
                }
                placeColumns.push({
                    ...place,
                    button: flexButtons
                });
            } else {
                placeColumns.push({
                    ...place
                });
            }
        }

        return {
            title: data.title,
            places: placeColumns
        };
    }

    async generateFlexPlaceMessage(params: IPublishFlexPlaceParams) {
        const contents: any[] = [];
        for (const place of params.places) {
            let content: any = {
                type: "bubble",
                size: "giga",
                hero: {
                    type: "image",
                    url: place.imageUrl,
                    size: "full",
                    aspectRatio: "20:13",
                    aspectMode: "cover"
                }
            };

            let bodyContents: any[] = [{
                type: "text",
                text: place.title,
                weight: "bold",
                size: "xl",
                contents: [{
                    type: "span",
                    text: place.title
                }]
            }];

            let boxContents: any[] = [];
            if (place.address) {
                boxContents.push({
                    type: "text",
                    text: `地點: ${place.address}`,
                    align: "start",
                    maxLines: 0,
                    position: "relative",
                    size: "xs",
                    wrap: true
                });
            }
            if (place.info) {
                switch (place.info.infoType) {
                    case EnumFlexPlaceInfoType.Date:
                        {
                            boxContents.push({
                                type: "text",
                                text: `時間: ${place.info.date ?? ''}`,
                                size: "xs",
                                wrap: true
                            });
                        }
                        break;
                    case EnumFlexPlaceInfoType.Price:
                        {
                            boxContents.push({
                                type: "text",
                                text: `價格: ${place.info.price ? Format.toCurrency(place.info.price) : ''}`,
                                size: "xs",
                                wrap: true
                            });
                        }
                        break;
                }
            }
            if (boxContents.length > 0) {
                bodyContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: boxContents
                });
            }
            content.body = {
                type: "box",
                layout: "vertical",
                contents: bodyContents
            }

            if (place.button) {
                const footerContents: any[] = [];
                for (const button of place.button) {
                    if (!button.action) {
                        continue;
                    }
                    footerContents.push({
                        type: "button",
                        style: "link",
                        height: "sm",
                        action: Format.setFlexActionLinkUri({
                            type: button.action.actionType,
                            uri: button.action.linkUrl,
                            text: button.action.text,
                            label: button.name
                        },  params.code, params.isShare, params.withoutTrace)
                    })
                }
                content.footer = {
                    type: "box",
                    layout: "vertical",
                    spacing: "sm",
                    contents: footerContents,
                    flex: 0
                }
            }
            contents.push(content)
        }

        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "carousel",
                contents: contents
            }
        }]

        return messages;
    }

    async generateFlexPersonTemplate(data: IGenerateFlexPersonTemplateParams): Promise<IGenerateFlexPersonTemplateResult> {
        const personColumns: IFlexPerson[] = [];
        if (data.persons.length > 9) {
            throw new AppError({ message: 'persons max 9 pages', code: ResultCode.clientError });
        }

        for (const person of data.persons) {
            const flexButtons: IFlexTemplateButtonParams[] = [];
            if (person.button) {
                for (const button of person.button) {
                    if (button.action) {
                        flexButtons.push({
                            name: button.name,
                            action: {
                                actionType: button.action.actionType,
                                ...this.getActionType({
                                    actionType: button.action.actionType,
                                    linkUrl: button.action.linkUrl,
                                    text: button.action.text,
                                })
                            }
                        })
                    }
                }
                personColumns.push({
                    ...person,
                    button: flexButtons
                });
            } else {
                personColumns.push({
                    ...person
                });
            }
        }

        return {
            title: data.title,
            persons: personColumns
        };
    }

    async generateFlexPersonMessage(params: IPublishFlexPersonParams) {
        const contents: any[] = [];
        for (const person of params.persons) {
            let content: any = {
                type: "bubble",
                hero: {
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "box",
                        layout: "vertical",
                        contents: [{
                            type: "image",
                            url: person.imageUrl,
                            size: "5xl",
                        }],
                        cornerRadius: "999999px",
                        borderColor: "#F8F9FA",
                        borderWidth: "20px",
                        width: "200px",
                        height: "200px",
                        margin: "25px"
                    }],
                    alignItems: "center"
                }
            }

            let bodyContents: any[] = [{
                type: "text",
                text: person.personName,
                weight: "bold",
                size: "xl",
                contents: [{
                    type: "span",
                    text: person.personName
                }]
            }];

            if (person.description) {
                bodyContents.push({
                    type: "box",
                    layout: "vertical",
                    contents: [{
                        type: "text",
                        text: person.description,
                        wrap: true,
                        size: "sm"
                    }]
                });
            }
            content.body = {
                type: "box",
                layout: "vertical",
                contents: bodyContents,
                position: "relative",
                alignItems: "center"
            }

            if (person.button) {
                const footerContents: any[] = [];
                for (const button of person.button) {
                    if (!button.action) {
                        continue;
                    }
                    footerContents.push({
                        type: "button",
                        style: "link",
                        height: "sm",
                        action: Format.setFlexActionLinkUri({
                            type: button.action.actionType,
                            uri: button.action.linkUrl,
                            text: button.action.text,
                            label: button.name
                        },  params.code, params.isShare, params.withoutTrace)
                    })
                }
                content.footer = {
                    type: "box",
                    layout: "vertical",
                    spacing: "sm",
                    contents: footerContents,
                    flex: 0
                }
            }
            contents.push(content)
        }

        const messages = [{
            type: "flex",
            altText: params.title,
            contents: {
                type: "carousel",
                contents: contents
            }
        }];

        return messages;
    }

    async generateImageMessage(params: IImageTemplateParams) {
        const messages = [{
            type: "image",
            originalContentUrl: params.imageUrl,
            previewImageUrl: params.imageUrl,
        }];

        return messages;
    }

    async generateVideoMessage(params: IVideoTemplateParams) {
        let imageUrl = 'https://jjdigi.sfo2.cdn.digitaloceanspaces.com/crosschannel/default/VIDEO_DEFAULT.png'
        if (params.imageUrl) {
            imageUrl = params.imageUrl;
        }
        const messages = [{
            type: "video",
            originalContentUrl: params.videoUrl,
            previewImageUrl: imageUrl
        }];

        return messages;
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
            case EnumTemplateActionType.Share:
                return {
                    actionType: EnumTemplateActionType.Share,
                };
            default:
                throw new AppError({
                    message: 'ActionType error',
                    code: ResultCode.clientError,
                });
        }
    }

    private getColor(value: EnumSloganColorType): { textColor: string, backgroundColor: string } {
        const color: string[] = [];
        let textColor = '';
        let backgroundColor = '';
        switch (value) {
            case EnumSloganColorType.OutlineInfo:
                {
                    /* color: #666f86; background-color: transparent; */
                    textColor = "#666f86";
                    backgroundColor = "#ffffff";
                } break;
            case EnumSloganColorType.Danger:
                {
                    /* color: #fff; background-color: #eb4e3d; */
                    textColor = "#ffffff";
                    backgroundColor = "#eb4e3d"
                } break;
            case EnumSloganColorType.Warning:
                {
                    /* color: #fff; background-color: #ed8537; */
                    textColor = "#ffffff";
                    backgroundColor = "#ed8537"
                } break;
            case EnumSloganColorType.Primary:
                {
                    /* color: #fff; background-color: #00B900; */
                    textColor = "#ffffff";
                    backgroundColor = "#00B900"
                } break;
            case EnumSloganColorType.Success:
                {
                    /* color: #fff; background-color: #5b82db; */
                    textColor = "#ffffff";
                    backgroundColor = "#5b82db"
                } break;
            case EnumSloganColorType.Info:
            default:
                /* color: #fff; background-color: #666f86; */
                {
                    textColor = "#ffffff";
                    backgroundColor = "#666f86"
                } break;
        }

        return {
            textColor,
            backgroundColor
        }
    }
}