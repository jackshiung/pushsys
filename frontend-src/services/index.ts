import { FileSvc } from './file';
import { TemplateSvc } from './template.svc';
import { NotificationSvc } from './notification.svc';
import { UserSvc } from './user.svc';
import { TargetSvc } from "./target.svc";
import { ShareSvc } from './share';


class ManagementService {
    user: UserSvc = new UserSvc;
    target: TargetSvc = new TargetSvc;
    notification: NotificationSvc = new NotificationSvc;
    template: TemplateSvc = new TemplateSvc;
    file: FileSvc = new FileSvc;
    share: ShareSvc = new ShareSvc;

}

const managementService = new ManagementService();

export {
    managementService
}