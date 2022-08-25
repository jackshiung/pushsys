import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';

export namespace JWT {
    export interface IJWTOptions {
        secret: string;
        expiresIn: number;
    }

    let options: IJWTOptions = {
        secret: '',
        expiresIn: 60 * 60 * 24,
    };

    export function initialize(initOptions: IJWTOptions): void {
        options = _.cloneDeep(initOptions);
    }

    export async function sign(payload: any, expiresIn: number = undefined): Promise<string> {
        let token = jwt.sign(payload, options.secret, {
            expiresIn: expiresIn ?? options.expiresIn,
        });
        return token;
    }

    export async function verify(token: string): Promise<any | null> {
        try {
            let payload = jwt.verify(token, options.secret);
            return payload;
        } catch {
            return null;
        }
    }
}

