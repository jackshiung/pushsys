import { bool } from 'aws-sdk/clients/signer';
import * as luxon from 'luxon';
import { config } from '../configuration';
import { FlexAction } from '../interfaces/lineTemplate.flex.interface';
import {
    EnumTemplateActionType,
    IGenerateImagemapAction,
} from '../interfaces/lineTemplate.interface';

export namespace Format {
    export function tryGetInteger(
        num: unknown,
        defaultValue: number | null = null
    ): number {
        const parsedNumber = Number(num);

        if (isNaN(parsedNumber)) {
            return defaultValue;
        }

        return Math.floor(parsedNumber);
    }

    export function tryGetDate(
        date: unknown,
        defaultValue: Date | null = null
    ): Date {
        if (date instanceof Date) {
            return date;
        }

        if (typeof date === 'string') {
            const formatToSecondsLuxon = luxon.DateTime.fromFormat(
                date,
                'YYYY-MM-DD HH:mm:ss'
            );

            if (formatToSecondsLuxon.isValid) {
                return formatToSecondsLuxon.toJSDate();
            }

            const ISOLuxon = luxon.DateTime.fromISO(date);

            if (ISOLuxon.isValid) {
                return ISOLuxon.toJSDate();
            }

            const formatToMinuteLuxon = luxon.DateTime.fromFormat(
                date,
                'YYYY-MM-DD HH:mm'
            );

            if (formatToMinuteLuxon.isValid) {
                return formatToMinuteLuxon.toJSDate();
            }
        }

        return defaultValue;
    }

    export function tryGetString(
        num: unknown,
        defaultValue: string | null = null
    ): string {
        if (typeof num === 'string') {
            return num;
        }

        if (typeof num === 'number') {
            return num.toString();
        }

        if (Array.isArray(num)) {
            return num.join(',');
        }

        return defaultValue;
    }

    export function tryGetBoolean(
        value: unknown,
        defaultValue: boolean | null = null
    ) {
        switch (value) {
            case true:
            case 'true':
            case 1:
            case '1':
            case 'on':
            case 'yes':
                return true;
            case false:
            case 'false':
            case 0:
            case '0':
            case 'off':
            case 'no':
                return false;
            default:
                return defaultValue;
        }
    }

    export function setClickedRedirect(code: string, linkUrl: string): string {
        const url = new URL(`${config.hookHost}/hook/line/clicked`);
        const urlParams = {
            code,
            linkUrl,
        };
        url.search = new URLSearchParams(urlParams).toString();
        return url.toString();
    }

    interface SetImagemapActionResult {
        type: EnumTemplateActionType;
        text?: string;
        linkUri?: string;
        area: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }

    export function setImagemapActionLinkUri(
        actions: IGenerateImagemapAction[],
        code: string,
        withoutTrace?: boolean
    ): SetImagemapActionResult[] {
        const resActions: SetImagemapActionResult[] = [];
        for (const action of actions) {
            switch (action.actionType) {
                case EnumTemplateActionType.Uri:
                    resActions.push({
                        linkUri: withoutTrace
                            ? action.linkUrl
                            : setClickedRedirect(code, action.linkUrl),
                        area: action.area,
                        type: action.actionType,
                    });
                    break;
                case EnumTemplateActionType.Message:
                    resActions.push({
                        text: action.text,
                        area: action.area,
                        type: action.actionType,
                    });
                    break;
                case EnumTemplateActionType.Share:
                    resActions.push({
                        linkUri:
                            `${config.shareUrl}?code=${code}&trace=` +
                            (withoutTrace ? '0' : '1'),
                        area: action.area,
                        type: EnumTemplateActionType.Uri,
                    });
                    break;
            }
        }
        return resActions;
    }

    interface SetFlexActionResult {
        type: EnumTemplateActionType;
        text?: string;
        uri?: string;
        label?: string;
        data?: string;
    }

    export function setFlexActionLinkUri(
        action: FlexAction,
        code: string,
        isShare: boolean,
        withoutTrace: boolean
    ): SetFlexActionResult {
        let resAction: SetFlexActionResult = { ...action };
        switch (action.type) {
            case EnumTemplateActionType.Uri:
                resAction = {
                    uri: withoutTrace
                        ? action.uri
                        : setClickedRedirect(code, action.uri),
                    type: action.type,
                };
                break;
            case EnumTemplateActionType.Message:
                if (isShare) {
                    resAction = {
                        uri: `${config.lineAtUrl}/?${encodeURIComponent(action.text)}`,
                        type: EnumTemplateActionType.Uri,
                    };
                } else {
                    resAction = {
                        text: action.text,
                        type: action.type,
                    };
                }

                break;
            case EnumTemplateActionType.Share:
                resAction = {
                    uri:
                        `${config.shareUrl}?code=${code}&trace=` +
                        (withoutTrace ? '0' : '1'),
                    type: EnumTemplateActionType.Uri,
                };
                break;
            default:
                // resAction = {
                //     data: `usercode=${code}`,
                //     type: EnumTemplateActionType.Postback,
                // };
                // break;
                return undefined;
        }
        if (action.label) {
            resAction.label = action.label;
        }
        return resAction;
    }

    export function toCurrency(num: number): string {
        const parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
}
