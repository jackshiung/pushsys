import { Inject, Service } from 'typedi';
import { IPushMessageResult } from '../interfaces/share.interface';
import { LineLibSvc } from '../libs/line.lib.svc';

@Service()
export class ShareService {
    @Inject()
    private lineLibSvc: LineLibSvc;

    async getPushMessageByTACode(code: string): Promise<IPushMessageResult> {
        const message = await this.lineLibSvc.getPushMessageByTACode(code);
        return {
            data: message,
        };
    }
}
