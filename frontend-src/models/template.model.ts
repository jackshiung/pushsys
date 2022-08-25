import { isEmpty, isNumber, isNumberString, isURL } from "class-validator";
import { EnumFlexPlaceInfoType, EnumTemplate, EnumTemplateActionType, IActionTemplate, IFlexPerson, IFlexPersonTemplateParams, IFlexPlace, IFlexPlaceTemplateParams, IFlexProduct, IFlexProductTemplateParams, IFlexTemplateButtonParams, IGenerateImagemapTemplateResult, IGenerateImageTemplateResult, IGenerateTextTemplateResult, IImageCarousel, IImageCarouselTemplateParams, TemplateMessage, IVideoTemplateParams, EnumSloganColorType } from "../services/template.svc";
import * as luxon from "luxon";

export const defaultVideoUrl = "https://jjdigi.sfo2.cdn.digitaloceanspaces.com/crosschannel/temp/isYbJXnvX-1634653128922.png";
export enum TemplateIds {
    text = "text",
    image = "image",
    imageText = "imageText",
    flex = "flex",
    video = "video"
}
export interface TabConfig {
    component: object;
    templateId: TemplateIds;
}
export function getIconClassName(template: TemplateIds): string {
    switch (template) {

        case TemplateIds.text:
            return "lar la-lg la-chat";

        case TemplateIds.image:
            return "lar la-lg la-image";

        case TemplateIds.imageText:
            return "lar la-lg la-chat-plus";

        case TemplateIds.flex:
            return "lar la-lg la-chat-edit";

        case TemplateIds.video:
            return "lar la-lg la-film-play";
    }

}

export function getTitle(template: TemplateIds): string {
    switch (template) {
        case TemplateIds.text:
            return "文字";

        case TemplateIds.image:
            return "圖片";

        case TemplateIds.imageText:
            return "圖文訊息";

        case TemplateIds.flex:
            return "多頁訊息";

        case TemplateIds.video:
            return "影片";
    }
}

export interface TemplateItem {
    type: TemplateIds
    text?: TemplateText
    image?: TemplateImage
    imageText?: TemplateImageText
    flex?: TemplateFlex
    video?: TemplateVideo
}

export interface TemplateText {
    text: string
}

export interface TemplateImage {
    imageUrl: string
    imageFile?: File
}

export interface TemplateVideo {
    url: string
    imageUrl?: string
    imageFile?: File
}


export interface TemplateImageText {
    imageUrl: string
    title: string
    imageFile?: File
    actions: TemplateAction[]
    type: ImageTextType
    imageHeight: number
}

export enum ImageTextType {
    textImageCustom = "text-image-custom",
    textImage_1 = "text-image-1",
    textImage_4 = "text-image-4",
    textImageVertical_2 = "text-image-vertical-2",
    textImageCover_3 = "text-image-cover-3",
    textImageHorizon_2 = "text-image-horizon-2",
    textImageHorizonCover_3 = "text-image-horizon-cover-3",
    textImageHorizon_3 = "text-image-horizon-3",
    textImageRectangle_6 = "text-image-rectangle-6",
}

export type ClientActionType = 'text' | 'url' | '' | 'share'

export interface TemplateAction {
    type: ClientActionType
    text?: string
    url?: string
}

export interface TemplateActionWithLabel extends TemplateAction {
    label: string
}


export interface BasicTemplateFlex {
    title: string
    type: FlexTypeIds
}

export type FlexTypeIds = 'product' | 'location' | 'person' | 'photo';

export type TemplateFlexProduct = BasicTemplateFlex & {
    type: 'product'
    items: TemplateFlexProductItem[]
}

export interface TemplateFlexProductItem {
    imageUrl?: string;
    imageFile?: File
    title: string;
    enabledPrice: boolean;
    price?: string | number;
    enabledDescription: boolean
    description?: string;
    enabledAction1: boolean;
    action1: TemplateActionWithLabel
    enabledAction2: boolean;
    action2: TemplateActionWithLabel
}

export type TemplateFlexPhoto = BasicTemplateFlex & {
    type: 'photo'
    items: TemplateFlexPhotoItem[]
}

export enum SloganColorType {

    // color: #ffffff; background-color: #666f86;
    info = "info",

    // color: #666f86; background-color: #ffffff;
    outlineInfo = "outlineInfo",

    // color: #ffffff; background-color: #eb4e3d;
    danger = "danger",

    // color: #ffffff; background-color: #ed8537;
    warning = "warning",

    // color: #ffffff; background-color: #00B900;
    primary = "primary",

    // color: #ffffff; background-color: #5b82db;
    success = "success"
}

export interface TemplateFlexPhotoItem {
    imageUrl: string
    imageFile?: File
    enabledAction: boolean
    action: TemplateActionWithLabel
    enabledSlogan: boolean
    slogan?: SloganType
}

export type SloganType = {
    text: string
    color: SloganColorType
}

export type TemplateFlexLocation = BasicTemplateFlex & {
    type: 'location'
    items: TemplateFlexLocationItem[]
}

export interface TemplateFlexLocationItem {
    imageUrl: string
    imageFile?: File
    title: string
    enabledAddressInfo: boolean
    addressInfo: {
        text: string
        lat: number
        lng: number
    }
    enabledInfo: boolean
    info: {
        type: 'price' | 'time'
        text: string
    }
    enabledAction1: boolean;
    action1: TemplateActionWithLabel
    enabledAction2: boolean;
    action2: TemplateActionWithLabel
}

export type TemplateFlexPerson = BasicTemplateFlex & {
    type: 'person'
    items: TemplateFlexPersonItem[]
}

export interface TemplateFlexPersonItem {
    imageUrl: string
    imageFile?: File
    name: string
    enabledDescription: boolean
    description: string
    enabledAction1: boolean
    action1: TemplateActionWithLabel
    enabledAction2: boolean
    action2: TemplateActionWithLabel
}

export type TemplateFlexItem = TemplateFlexProductItem | TemplateFlexPhotoItem | TemplateFlexLocationItem | TemplateFlexPersonItem
export type TemplateFlex = (TemplateFlexProduct | TemplateFlexPhoto | TemplateFlexLocation | TemplateFlexPerson)


export function parseServiceMessagesToTemplateItems(message: TemplateMessage): TemplateItem {

    const item: TemplateItem = {
        type: getTemplateIdByMessage(message)
    }

    switch (item.type) {
        case TemplateIds.text:
            const textData: IGenerateTextTemplateResult = message.data as IGenerateTextTemplateResult
            item.text = {
                text: textData.content
            }
            break;

        case TemplateIds.image:
            const imageData: IGenerateImageTemplateResult = message.data as IGenerateImageTemplateResult
            item.image = {
                imageUrl: imageData.imageUrl
            }
            break;
        case TemplateIds.imageText:
            const imageTextData: IGenerateImagemapTemplateResult = message.data as IGenerateImagemapTemplateResult
            item.imageText = {
                title: imageTextData.title,
                imageUrl: imageTextData.imageUrl,
                imageHeight: imageTextData.customHight,
                type: getTemplateImageTextTypeByMessage(message),
                actions: imageTextData.actions.map(item => {
                    const result: TemplateAction = {
                        type: getClientActionTypeByEnumTemplateActionType(item.actionType),
                        text: '',
                        url: ''
                    }
                    if (result.type === "text") {
                        result.text = item.text;
                    } else if (result.type === "url") {
                        result.url = item.linkUrl
                    }
                    return result;
                })
            }
            break;
        case TemplateIds.flex:
            const flex = parseMessageToTemplateFlex(message)
            item.flex = flex;
            break;
        case TemplateIds.video:
            const videoData = message.data as IVideoTemplateParams;
            item.video = {
                url: videoData.videoUrl,
                imageUrl: videoData.imageUrl
            }
            break;
    }

    return item
}

function parseMessageToTemplateFlex(message: TemplateMessage): TemplateFlex {
    const flexTypeId = getFlexTypeIdsByEnumTemplate(message.template);

    switch (flexTypeId) {
        case 'location':
            const placeMessage = message.data as IFlexPlaceTemplateParams
            const location: TemplateFlexLocation = {
                type: flexTypeId,
                title: placeMessage.title,
                items: placeMessage.places.map(place => {
                    const item = getEmptyFlexItemByFlexTypeId(flexTypeId) as TemplateFlexLocationItem

                    item.title = place.title;
                    //TODO:
                    item.enabledInfo = !isEmpty(place.info)
                    item.enabledAddressInfo = !isEmpty(place.address)
                    item.imageUrl = place.imageUrl;

                    if (item.enabledInfo) {
                        if (place.info.infoType === EnumFlexPlaceInfoType.Date) {
                            item.info.text = place.info.date
                            item.info.type = "time"
                        } else {
                            item.info.text = place.info.price.toString()
                            item.info.type = "price"
                        }
                    }

                    if (item.enabledAddressInfo) {
                        item.addressInfo.text = place.address
                    }
                    setActionsByButton(item, place.button)
                    return item
                })
            }
            return location;
        case 'person':
            const personMessage = message.data as IFlexPersonTemplateParams
            const person: TemplateFlexPerson = {
                type: flexTypeId,
                title: personMessage.title,
                items: personMessage.persons.map(person => {
                    const item = getEmptyFlexItemByFlexTypeId(flexTypeId) as TemplateFlexPersonItem
                    item.name = person.personName;
                    item.enabledDescription = !isEmpty(person.description)
                    item.imageUrl = person.imageUrl;
                    if (item.enabledDescription) {
                        item.description = person.description
                    }
                    setActionsByButton(item, person.button)
                    return item
                })
            }
            return person;
        case 'product':
            const productMessage = message.data as IFlexProductTemplateParams
            const product: TemplateFlexProduct = {
                type: flexTypeId,
                title: productMessage.title,
                items: productMessage.products.map(product => {
                    const item = getEmptyFlexItemByFlexTypeId(flexTypeId) as TemplateFlexProductItem
                    item.title = product.title;
                    item.imageUrl = product.imageUrl;
                    item.enabledDescription = !isEmpty(product.description)
                    item.enabledPrice = !isEmpty(product.price)
                    if (item.enabledDescription) {
                        item.description = product.description
                    }
                    if (item.enabledPrice) {
                        item.price = product.price
                    }
                    setActionsByButton(item, product.button)
                    return item
                })
            }
            return product
        case 'photo':
            const photoMessage = message.data as IImageCarouselTemplateParams
            const photo: TemplateFlexPhoto = {
                type: flexTypeId,
                title: photoMessage.title,
                items: photoMessage.images.map(image => {
                    const item = getEmptyFlexItemByFlexTypeId(flexTypeId) as TemplateFlexPhotoItem
                    item.imageUrl = image.imageUrl;
                    item.enabledAction = !isEmpty(image?.action?.actionType) && image?.action?.actionType !== EnumTemplateActionType.Empty
                    item.enabledSlogan = !isEmpty(image?.slogan?.text)

                    if (item.enabledAction) {
                        item.action = {
                            label: image?.action?.label,
                            type: getClientActionTypeByEnumTemplateActionType(image.action.actionType),
                        }

                        if (item.action.type === "url") {
                            item.action.url = image.action.linkUrl;
                        }

                        if (item.action.type === "text") {
                            item.action.text = image.action.text;
                        }
                    }

                    if (item.enabledSlogan) {
                        item.slogan = {
                            color: image.slogan.color as unknown as SloganColorType,
                            text: image.slogan.text
                        }
                    }

                    return item
                })
            }
            return photo

    }
}


function getTemplateIdByMessage(message: TemplateMessage): TemplateIds {
    switch (message.template) {
        case EnumTemplate.Text:
            return TemplateIds.text;
        case EnumTemplate.Image:
            return TemplateIds.image;
        case EnumTemplate.Video:
            return TemplateIds.video;
        case EnumTemplate.CardtypePerson:
        case EnumTemplate.CardtypePlace:
        case EnumTemplate.CardtypeProduct:
        case EnumTemplate.ImageCarousel:
            return TemplateIds.flex;
        default:
            return TemplateIds.imageText
    }
}


function getFlexTypeIdsByEnumTemplate(enumTemplate: EnumTemplate): FlexTypeIds {
    switch (enumTemplate) {
        case EnumTemplate.CardtypePerson:
            return 'person';
        case EnumTemplate.CardtypePlace:
            return 'location'
        case EnumTemplate.CardtypeProduct:
            return 'product'
        case EnumTemplate.ImageCarousel:
            return 'photo'
        default:
            throw new Error(`unknown enumTemplate ${enumTemplate}`)
    }
}

function getTemplateImageTextTypeByMessage(message: TemplateMessage): ImageTextType {
    switch (message.template) {
        case EnumTemplate.ImagemapCustom:
            return ImageTextType.textImageCustom;

        case EnumTemplate.ImagemapSquare:
            return ImageTextType.textImage_1;

        case EnumTemplate.Imagemap2x2:
            return ImageTextType.textImage_4;

        case EnumTemplate.Imagemap1n2Col:
            return ImageTextType.textImageCover_3;

        case EnumTemplate.Imagemap1n2Row:
            return ImageTextType.textImageHorizonCover_3;

        case EnumTemplate.Imagemap2x1:
            return ImageTextType.textImageHorizon_2;

        case EnumTemplate.Imagemap3x1:
            return ImageTextType.textImageHorizon_3;

        case EnumTemplate.Imagemap2x3:
            return ImageTextType.textImageRectangle_6;

        case EnumTemplate.Imagemap1x2:
            return ImageTextType.textImageVertical_2;
    }
}

export function getEmptyFlexItemByFlexTypeId(id: FlexTypeIds): TemplateFlexItem {
    switch (id) {
        case "location":
            const location: TemplateFlexLocationItem = {
                action1: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                action2: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                enabledAction1: false,
                enabledAction2: false,
                addressInfo: {
                    lat: 0,
                    lng: 0,
                    text: ''
                },
                enabledAddressInfo: false,
                enabledInfo: false,
                imageUrl: '',
                info: {
                    text: '',
                    type: 'time'
                },
                title: '',
                imageFile: null
            }
            return location
        case "person":
            const person: TemplateFlexPersonItem = {
                action1: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                action2: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                enabledAction1: false,
                enabledAction2: false,
                name: '',
                description: '',
                enabledDescription: false,
                imageUrl: '',
                imageFile: null,

            }
            return person
        case "photo":
            const photo: TemplateFlexPhotoItem = {
                imageUrl: '',
                imageFile: null,
                enabledAction: false,
                action: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                enabledSlogan: false,
                slogan: {
                    color: null,
                    text: ''
                }
            }

            return photo
        case "product":
            const product: TemplateFlexProductItem = {
                imageUrl: '',
                title: '',
                price: 0,
                description: '',
                action1: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                },
                enabledAction1: false,
                enabledAction2: false,
                enabledDescription: false,
                enabledPrice: false,
                action2: {
                    label: '',
                    type: 'url',
                    text: '',
                    url: '',
                }
            }
            return product
    }
}

export function validateFlexPhoto(item: TemplateFlexPhoto, sectionText: string) {
    if (isEmpty(item.title)) {
        throw new Error(`${sectionText}錯誤：需輸入標題`);
    }

    item.items.forEach((value, index) => {
        if (isEmpty(value.imageUrl)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需選擇圖片`);
        }

        if (value.enabledAction && value.action.type === "url" && !isURL(value.imageUrl)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需要輸入網址`);
        }

        if (value.enabledAction && value.action.type === "text" && isEmpty(value.action?.text)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入文字`);
        }

        if (value.enabledSlogan) {
            if (isEmpty(value.slogan?.color)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需選擇標語樣式`);
            }

            if (isEmpty(value.slogan?.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入標語`);
            }
        }
    })
}

export function validateFlexProduct(product: TemplateFlexProduct, sectionText: string) {
    if (isEmpty(product.title)) {
        throw new Error(`${sectionText}錯誤：需輸入標題`);
    }

    product.items.map((item, index) => {

        if (!isURL(item.imageUrl)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需選擇圖片`);
        }

        if (isEmpty(item.title)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入標題`);
        }

        if (item.enabledDescription) {
            if (isEmpty(item.description.trim())) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入問字說明`);
            }
        }

        if (item.enabledPrice) {
            let price = item.price;
            if (typeof price === "string") {
                price = +price;
            }
            if (!isNumber(price) || price < 0) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入大於 0 金額`);
            }
        }

        if (item.enabledAction1) {
            if (item.action1.type === "url" && !isURL(item.action1.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需輸入網址`);
            }

            if (item.action1.type === "text" && isEmpty(item.action1.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需輸入文字`);
            }
        }

        if (item.enabledAction2) {
            if (item.action2.type === "url" && !isURL(item.action2.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入網址`);
            }

            if (item.action2.type === "text" && isEmpty(item.action2.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入文字`);
            }
        }
    })
}

export function validateFlexLocation(location: TemplateFlexLocation, sectionText: string) {
    if (isEmpty(location.title)) {
        throw new Error(`${sectionText}錯誤：需輸入標題`);
    }

    location.items.map((item, index) => {

        if (!isURL(item.imageUrl)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需選擇圖片`);
        }

        if (isEmpty(item.title)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入標題`);
        }

        if (item.enabledAddressInfo) {
            if (isEmpty(item.addressInfo.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需地址`);
            }
        }

        if (item.enabledInfo) {
            if (item.info.type === "time") {
                const d = luxon.DateTime.fromFormat(item.info.text, "HH:mm");
                if (!d.isValid) {
                    throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的時間格式錯誤`);
                }
            } else if (item.info.type === "price") {
                if (!isNumberString(item.info.text)) {
                    throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的價格格式錯誤`);
                }
            }
        }

        if (item.enabledAction1) {
            if (item.action1.type === "url" && !isURL(item.action1.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需輸入網址`);
            }

            if (item.action1.type === "text" && isEmpty(item.action1.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需輸入文字`);
            }
        }

        if (item.enabledAction2) {
            if (item.action2.type === "url" && !isURL(item.action2.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入網址`);
            }

            if (item.action2.type === "text" && isEmpty(item.action2.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入文字`);
            }
        }
    })
}

export function validateFlexPerson(person: TemplateFlexPerson, sectionText: string) {
    if (isEmpty(person.title)) {
        throw new Error(`${sectionText}錯誤：需輸入標題`);
    }

    person.items.map((item, index) => {

        if (!isURL(item.imageUrl)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需選擇圖片`);
        }

        if (isEmpty(item.name)) {
            throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入姓名`);
        }

        if (item.enabledDescription) {
            if (isEmpty(item.description)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 需輸入文字說明`);
            }
        }


        if (item.enabledAction1) {
            if (item.action1.type === "url" && !isURL(item.action1.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需輸入網址`);
            }

            if (item.action1.type === "text" && isEmpty(item.action1.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作一需文字`);
            }
        }

        if (item.enabledAction2) {
            if (item.action2.type === "url" && !isURL(item.action2.url)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入網址`);
            }

            if (item.action2.type === "text" && isEmpty(item.action2.text)) {
                throw new Error(`${sectionText}錯誤：分頁 ${index + 1} 的動作二需輸入文字`);
            }
        }
    })
}


export function generateFlexItem(item: TemplateFlex): TemplateMessage {

    const result: TemplateMessage = {
        template: null,
        data: null
    }

    if (item.type === "photo") {
        result.template = EnumTemplate.ImageCarousel
        const data: IImageCarouselTemplateParams = {

            title: item.title,
            images: item.items.map((image) => {

                const result: IImageCarousel = {
                    imageUrl: image.imageUrl,
                    action: {
                        label: image.action?.label ?? "",
                        actionType: EnumTemplateActionType.Empty,
                    }
                }

                if (image.enabledAction) {

                    if (image.action.type === "text") {
                        result.action.text = image.action.text;
                        result.action.actionType = EnumTemplateActionType.Message

                    } else if (image.action.type === "url") {
                        result.action.linkUrl = image.action.url;
                        result.action.actionType = EnumTemplateActionType.Uri

                    } else if (image.action.type === "share") {
                        result.action.actionType = EnumTemplateActionType.Share;
                    }
                }

                if (image.enabledSlogan) {
                    result.slogan = {
                        color: image.slogan.color as unknown as EnumSloganColorType,
                        text: image.slogan.text
                    }
                }

                return result;
            }),

        }
        result.data = data;
    }

    if (item.type === "location") {
        result.template = EnumTemplate.CardtypePlace
        const data: IFlexPlaceTemplateParams = {
            title: item.title,
            places: item.items.map((tab) => {
                const result: IFlexPlace = {
                    imageUrl: tab.imageUrl,
                    title: tab.title,
                    address: tab.enabledAddressInfo ? tab.addressInfo.text : undefined,
                    button: getButtonByAction(tab)
                }

                if (tab.enabledInfo) {


                    if (tab.info.type === "price") {

                        result.info = {
                            infoType: EnumFlexPlaceInfoType.Price,
                            price: +tab.info.text
                        }
                    } else {
                        result.info = {
                            infoType: EnumFlexPlaceInfoType.Date,
                            date: tab.info.text
                        }
                    }

                }
                return result
            })
        }
        result.data = data;
    }


    if (item.type === "person") {
        result.template = EnumTemplate.CardtypePerson
        const data: IFlexPersonTemplateParams = {
            title: item.title,
            persons: item.items.map((tab) => {
                const result: IFlexPerson = {
                    imageUrl: tab.imageUrl,
                    personName: tab.name,
                    description: tab.enabledDescription ? tab.description : undefined,
                    button: getButtonByAction(tab)
                }
                return result
            })
        }
        result.data = data;
    }

    if (item.type === "product") {
        result.template = EnumTemplate.CardtypeProduct
        const data: IFlexProductTemplateParams = {
            title: item.title,
            products: item.items.map((tab) => {
                const result: IFlexProduct = {
                    imageUrl: tab.imageUrl,
                    title: tab.title,
                    description: tab.enabledDescription ? tab.description : undefined,
                    price: tab.enabledPrice ? +tab.price : undefined,
                    button: getButtonByAction(tab)
                }
                return result
            })
        }
        result.data = data;
    }

    return result
}
type MultiActionInfo = {
    enabledAction1: boolean;
    action1: TemplateActionWithLabel
    enabledAction2: boolean;
    action2: TemplateActionWithLabel
}

function getButtonByAction(actionInfo: MultiActionInfo): IFlexTemplateButtonParams[] {
    const button: IFlexTemplateButtonParams[] = []

    if (actionInfo.enabledAction1) {
        const action1: IFlexTemplateButtonParams = {
            name: actionInfo.action1.label,
            action: {
                actionType: null
            }
        }
        if (actionInfo.action1.type === "url") {
            action1.action = {
                actionType: EnumTemplateActionType.Uri,
                linkUrl: actionInfo.action1.url
            }
        } else if (actionInfo.action1.type === "text") {
            action1.action = {
                actionType: EnumTemplateActionType.Message,
                text: actionInfo.action1.text
            }
        } else if (actionInfo.action1.type === "share") {
            action1.action = {
                actionType: EnumTemplateActionType.Share,
            }
        }

        button.push(action1)
    }

    if (actionInfo.enabledAction2) {
        const action2: IFlexTemplateButtonParams = {
            name: actionInfo.action2.label,
            action: {
                actionType: null
            }
        }
        if (actionInfo.action2.type === "url") {
            action2.action = {
                actionType: EnumTemplateActionType.Uri,
                linkUrl: actionInfo.action2.url
            }
        } else if (actionInfo.action2.type === "text") {
            action2.action = {
                actionType: EnumTemplateActionType.Message,
                text: actionInfo.action2.text
            }
        } else if (actionInfo.action2.type === "share") {
            action2.action = {
                actionType: EnumTemplateActionType.Share,
            }
        }

        button.push(action2)
    }

    return button
}


function setActionsByButton(item: MultiActionInfo, button: IFlexTemplateButtonParams[]): void {

    if (isEmpty(button)) {
        return;
    }

    const [button1, button2] = button

    if (button1) {
        item.enabledAction1 = true;
        item.action1 = {
            label: button1.name,
            type: getClientActionTypeByEnumTemplateActionType(button1.action.actionType),
        }
        if (item.action1.type === "text") {
            item.action1.text = button1.action.text;
        } else if (item.action1.type === "url") {
            item.action1.url = button1.action.linkUrl;
        }
    }

    if (button2) {
        item.enabledAction2 = true;
        item.action2 = {
            label: button2.name,
            type: getClientActionTypeByEnumTemplateActionType(button2.action.actionType),
        }
        if (item.action2.type === "text") {
            item.action2.text = button2.action.text;
        } else if (item.action2.type === "url") {
            item.action2.url = button2.action.linkUrl;
        }
    }
}


export function parseToTemplateMessage(basic: TemplateItem, addItems: TemplateItem[]): TemplateMessage[] {
    const ret: TemplateMessage[] = [];

    if (basic) {
        ret.push({
            template: EnumTemplate.Text,
            data: {
                content: basic.text.text,
            },
        });
    }

    for (const item of addItems) {
        switch (item.type) {
            case TemplateIds.video:
                ret.push({
                    template: EnumTemplate.Video,
                    data: {
                        videoUrl: item.video.url,
                        imageUrl: item.video.imageUrl ? item.video.imageUrl : null
                    },
                });

                break;
            case TemplateIds.text:
                ret.push({
                    template: EnumTemplate.Text,
                    data: {
                        content: item.text.text,
                    },
                });
                break;
            case TemplateIds.image:
                ret.push({
                    template: EnumTemplate.Image,
                    data: {
                        imageUrl: item.image.imageUrl,
                    },
                });
                break;
            case TemplateIds.imageText:

                let customHight: number = undefined;
                if (item.imageText.type === ImageTextType.textImageCustom) {
                    customHight = item.imageText.imageHeight;
                }

                ret.push({
                    template: getTemplateByImageTextType(item.imageText.type),
                    data: {
                        customHight,
                        title: item.imageText.title,
                        imageUrl: item.imageText.imageUrl,
                        actions: item.imageText.actions.map((action) => {
                            const ret = new IActionTemplate();
                            if (action.type === "text") {
                                ret.actionType = EnumTemplateActionType.Message;
                                ret.text = action.text;
                            } else if (action.type === "url") {
                                ret.actionType = EnumTemplateActionType.Uri;
                                ret.linkUrl = action.url;
                            } else if (action.type === "share") {
                                ret.actionType = EnumTemplateActionType.Share;
                            }
                            return ret;
                        }),
                    },
                });
                break;
            case TemplateIds.flex:
                ret.push(generateFlexItem(item.flex));
                break;
        }
    }

    return ret;
}

function getTemplateByImageTextType(type: ImageTextType): EnumTemplate {
    switch (type) {
        case ImageTextType.textImageCustom:
            return EnumTemplate.ImagemapCustom;

        case ImageTextType.textImage_1:
            return EnumTemplate.ImagemapSquare;

        case ImageTextType.textImage_4:
            return EnumTemplate.Imagemap2x2;

        case ImageTextType.textImageCover_3:
            return EnumTemplate.Imagemap1n2Col;

        case ImageTextType.textImageHorizonCover_3:
            return EnumTemplate.Imagemap1n2Row;

        case ImageTextType.textImageHorizon_2:
            return EnumTemplate.Imagemap2x1;

        case ImageTextType.textImageHorizon_3:
            return EnumTemplate.Imagemap3x1;

        case ImageTextType.textImageRectangle_6:
            return EnumTemplate.Imagemap2x3;

        case ImageTextType.textImageVertical_2:
            return EnumTemplate.Imagemap1x2;
    }
}

export interface SloganColor {
    text: string;
    background: string;
    type: SloganColorType;
}

export const sloganConfigs: SloganColor[] = [
    {
        text: "#ffffff",
        background: "#666f86",
        type: SloganColorType.info,
    },
    {
        text: "#666f86",
        background: "#ffffff",
        type: SloganColorType.outlineInfo,
    },
    {
        text: "#ffffff",
        background: "#eb4e3d",
        type: SloganColorType.danger,
    },
    {
        text: "#ffffff",
        background: "#ed8537",
        type: SloganColorType.warning,
    },
    {
        text: "#ffffff",
        background: "#00B900",
        type: SloganColorType.primary,
    },
    {
        text: "#ffffff",
        background: "#5b82db",
        type: SloganColorType.success,
    },
];

export function isDisableByActionAndLabel(action: TemplateAction, enabledAction: boolean): boolean {
    if (!enabledAction) {
        return true
    }

    if (action.type === "share") {
        return true
    }

    return false
}

export function getClientActionTypeByEnumTemplateActionType(type: EnumTemplateActionType): ClientActionType {
    switch (type) {
        case EnumTemplateActionType.Empty:
            return "";
        case EnumTemplateActionType.Message:
            return "text"
        case EnumTemplateActionType.Share:
            return "share";
        case EnumTemplateActionType.Uri:
            return "url";
    }
}

export function getEnumTemplateActionTypeByClientActionType(type: ClientActionType): EnumTemplateActionType {
    switch (type) {
        case "":
            return EnumTemplateActionType.Empty;
        case "share":
            return EnumTemplateActionType.Share;
        case "text":
            return EnumTemplateActionType.Message;
        case "url":
            return EnumTemplateActionType.Uri
    }
}