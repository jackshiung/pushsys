import crypto from 'crypto';
import moment from 'moment';

export namespace CDP {
    const ENC_KEY = "ESiAIM2019xxxxxxxxxxxxxxxxxxxxxx"; // set random encryption key
    const IV = "ESiAIM2019xxxxxx"; // set random initialisation vector

    export function encryptedCheckCode(): string {
        // 利用 AES256 進行加密
        let cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV);
        let encrypted = cipher.update(`ESi${moment().utc().format('YYYYMMDDHHmm')}`, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    export function decryptedCheckCode(code: string) {
        let decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV);
        let decrypted = decipher.update(code, 'base64', 'utf8');
        decrypted += decipher.final();
        return decrypted;
    }
}