import base62 from 'base62';
import nanoTime from 'nano-time';

export namespace ShortenUrl {
    export function makeRandomString(length: number): string {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    export function makeRandomStringByNanotime(): string {
        nanoTime();
        const temp: string[] = [];
        const nt = nanoTime.micro();
        const code = base62.encode(nt);
        return code;
    }
}