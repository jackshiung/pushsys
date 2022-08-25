import sharp from 'sharp';

export namespace Image {
    export enum EnumImageSize {
        px1040 = 1040,
        px700 = 700,
        px460 = 460,
        px300 = 300,
        px240 = 240,
        custom = 0
    }
    //正方形版型為1040px × 1040px、自訂版型為寬度1040px × 高度520～2080px。
    export async function resize(data: Buffer, size: EnumImageSize, customHight?: number): Promise<Buffer> {
        const imageBuffer = await sharp(data).resize(size, size).toBuffer();
        return imageBuffer;
    }
}