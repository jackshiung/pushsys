import type { ValidationError } from "class-validator";
import * as luxon from "luxon";
import { ImageCondition, ImageInfo } from "../models/file.vm";
import commaNumber from "comma-number";

/**
* 有千分為逗號的數字
*/
export function parseCommaNumber(num: number | string): string {
    if (typeof num === "string") {
        const val = parseFloat(num);
        if (isNaN(val)) {
            throw new Error(`format error`)
        }

        num = val;
    }
    return commaNumber(num)
}

export function tryGetInteger(value: unknown, defaultValue: number = undefined): number {

    if (typeof value === "number") {
        return Math.ceil(+value)
    }

    if (typeof value === "string") {
        if (isNaN(parseInt(value))) {
            return defaultValue
        }
    }

    if (value === undefined || value === null) {
        return defaultValue
    }

    if (isNaN(+value)) {
        return defaultValue
    }

    return Math.ceil(+value)
}

export function tryGetString(str: unknown, defaultValue: string | null = null): string {

    if (typeof str === "string") {
        return str;
    }

    if (typeof str === "number") {
        return str.toString();
    }

    if (Array.isArray(str)) {
        return str.join(",")
    }

    return defaultValue;
}


export function tryGetDateString(str: unknown, defaultValue: string = ""): string {

    if (typeof str === "string") {
        const d = luxon.DateTime.fromFormat(str, "yyyy-MM-dd");

        if (!d.isValid) {
            return defaultValue
        }

        return str;
    }

    return defaultValue
}


export function tryGetFloat(value: unknown, defaultValue: number = undefined): number {

    if (typeof value === "number") {
        return Math.ceil(+value)
    }

    if (typeof value === "string") {
        if (isNaN(parseFloat(value))) {
            return defaultValue
        }
    }

    if (value === undefined || value === null) {
        return defaultValue
    }

    if (isNaN(+value)) {
        return defaultValue
    }

    return +value
}


export function parseISOStringToDate(date: string | Date): Date {

    if (date instanceof Date) {
        return date
    }

    return luxon.DateTime.fromISO(date).toJSDate()
}

export function formatUnknownDate(date: unknown): string {

    if (date instanceof Date) {
        const d = luxon.DateTime.fromJSDate(date);

        if (d.isValid) {
            return d.toFormat("yyyy-MM-dd HH:mm");
        }
    }

    if (typeof date === "string") {
        const d1 = luxon.DateTime.fromISO(date);

        if (d1.isValid) {
            return d1.toFormat("yyyy-MM-dd HH:mm");
        }

        const d2 = luxon.DateTime.fromFormat(date, "yyyy-MM-dd HH:mm")

        if (d2.isValid) {
            return d2.toFormat("yyyy-MM-dd HH:mm");
        }

        const d3 = luxon.DateTime.fromFormat(date, "yyyy-MM-dd HH:mm:ss")

        if (d3.isValid) {
            return d3.toFormat("yyyy-MM-dd HH:mm");
        }
    }

    return "";
}

export function formateDateByJSDate(date: Date | null): string {

    if (!date) {
        return ""
    }
    try {
        return luxon.DateTime.fromJSDate(date).toFormat("yyyy-MM-dd HH:mm");
    } catch (error) {
        return ""
    }

}

export function delay(seconds: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, seconds * 1000);
    })
}

export function getErrorMessagesByValidateErrors(errors: ValidationError[]): string[] {
    return errors.map(
        (item) => item.constraints[Object.keys(item.constraints)[0]]
    );
}




export function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }


    return new File([u8arr], filename, { type: mime });
}

export function getImageInfoByFile(file: File): Promise<ImageInfo> {
    return new Promise<ImageInfo>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const image = new Image();
            image.src = e.target.result as string;
            image.onload = () => {
                resolve({
                    base64: e.target.result as string,
                    width: image.width,
                    height: image.height
                });
            }
        }

        reader.onerror = function (e) {
            console.log(`getImageInfo error `, e)
            reject(new Error(`圖片格式錯誤`));
        };
        reader.readAsDataURL(file);
    });
}

export function validateImageSize(file: File, imageCondition: ImageCondition): Promise<string | ArrayBuffer> {
    return new Promise<string | ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const image = new Image();
            image.src = e.target.result as string;
            image.onload = () => {
                if (+imageCondition.ration.toFixed(4) !== +(image.width / image.height).toFixed(4)) {
                    reject("圖片尺寸不符合");
                    return;
                }

                if (image.width < imageCondition.width) {
                    reject(`寬度不符合, 需大於 ${imageCondition.width} px`);
                    return;
                }

                if (image.height < imageCondition.height) {
                    reject(`高度不符合, 需大於 ${imageCondition.height} px`);
                    return;
                }

                resolve(e.target.result);
            };
        };

        reader.onerror = function (e) {
            reject(`圖片格式錯誤`);
        };
        reader.readAsDataURL(file);
    });
}