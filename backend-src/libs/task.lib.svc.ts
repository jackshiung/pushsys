import { Inject, Service } from "typedi";
import TaskEntity, { EnumActionType, EnumTaskChannel, EnumTaskStatus } from "../entities/task.entity";
import { IBaseSearchParams, ISearchResult } from "../interfaces/base.interface";
import { BaseService } from "./base.lib.svc";
import { typeChecker } from "camel-toolbox";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { TaskRepository } from "../repositories/task.repo";
import { ICreateTaskParams, ICreateTaskResult, IResendTaskParams, IResendTaskResult, ISearchTaskParams, ISearchTaskResult, ITaskRun, ITaskTagParams, IUpdateTaskParams, IUpdateTaskResult } from "../interfaces/task.interface";
import moment from "moment";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";
import { TaskClickedLibSvc } from "./taskClicked.svc";
import { ICreateTaskTargetAudienceParams } from "../interfaces/taskTargetAudience.interface";
import { config } from "../configuration";
import { TargetAudienceGroupItemRepository } from "../repositories/targetAudienceGroupItem.repo";
import { TaskReadLibSvc } from "./taskRead.svc";

@Service()
export class TaskLibSvc extends BaseService<TaskEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskRepository: TaskRepository;

    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceGroupItemRepository: TargetAudienceGroupItemRepository;

    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;
    @Inject()
    private taskClickedLibSvc: TaskClickedLibSvc;
    @Inject()
    private taskReadLibSvc: TaskReadLibSvc;

    async findOneOrError(id: number): Promise<TaskEntity> {
        const task = await this.taskRepository.findOne({
            relations: ["taskTargetAudiences"],
            where: {
                id,
                isDeleted: false
            }
        })
        if (typeChecker.isNullOrUndefinedObject(task)) {
            throw new AppError({ message: '查無此任務', code: ResultCode.clientError })
        }
        return task;
    }

    async findOne(id: number): Promise<ISearchTaskResult> {
        const task = await this.findOneOrError(id);
        return {
            id: task.id,
            name: task.name,
            startTime: moment(task.startTime).format('YYYY-MM-DD HH:mm:ss'),
            actionType: task.actionType,
            channel: task.channel,
            status: task.status,
            ta: {
                count: task.taskTargetAudiences.length,
                readCount: await this.taskReadLibSvc.getReadCount(task.id),
                clickedCount: await this.taskClickedLibSvc.getClickedCount(task.id)
            },
            createDate: task.createDate,
            templateId: task.lineTemplateId
        }
    }

    async findOnePending(): Promise<TaskEntity> {
        const task = await this.taskRepository.findOne({
            status: EnumTaskStatus.Pending,
            isDeleted: false
        });
        return task;
    }

    async findAll(params: IBaseSearchParams): Promise<ISearchResult<ISearchTaskResult[]>> {
        const tasks: ISearchTaskResult[] = [];
        const data = await this.search({
            offset: params.offset,
            limit: params.limit,
        });
        for (const task of data.rows) {
            tasks.push({
                id: task.id,
                name: task.name,
                startTime: moment(task.startTime).format('YYYY-MM-DD HH:mm:ss'),
                actionType: task.actionType,
                channel: EnumTaskChannel.Messenger,
                status: task.status,
                ta: {
                    count: task.taskTargetAudiences.length,
                    readCount: await this.taskReadLibSvc.getReadCount(task.id),
                    clickedCount: await this.taskClickedLibSvc.getClickedCount(task.id)
                },
                createDate: task.createDate,
                templateId: task.lineTemplateId
            });
        }
        return {
            count: data.count,
            rows: tasks
        };
    }

    async searchForExport(startDate: string, endDate: string): Promise<ISearchResult<TaskEntity[]>> {
        const [tasks, count] = await this.taskRepository.createQueryBuilder('task')
            .leftJoinAndSelect("task.taskTargetAudiences", "taskTargetAudience")
            .leftJoinAndSelect("taskTargetAudience.targetAudience", "targetAudience")
            .where('task.isConfirmed = true')
            .andWhere('task.isDeleted = false')
            .andWhere('task.startTime BETWEEN :startDate AND :endDate', {
                startDate: moment(startDate).startOf('day').toDate(),
                endDate: moment(endDate).endOf('day').toDate()
            })
            .getManyAndCount();

        return {
            rows: tasks,
            count
        };
    }

    async search(params: ISearchTaskParams): Promise<ISearchResult<TaskEntity[]>> {
        const filters: any = {};
        filters.isDeleted = false;
        if (params.id) {
            filters.id = params.id;
        }
        const [tasks, count] = await this.taskRepository.findAndCount({
            relations: ["taskTargetAudiences"],
            where: filters,
            order: {
                id: "DESC"
            },
            skip: params.offset,
            take: params.limit
        })

        return {
            rows: tasks,
            count
        };
    }

    //TODO: HARDCODE
    async create(params: ICreateTaskParams): Promise<ICreateTaskResult> {
        await this.validateObject(ICreateTaskParams, params);
        let task = new TaskEntity();
        task.companyId = params.companyId;
        task.name = params.name;
        task.actionType = EnumActionType.Marketing; //params.actionType;
        task.channel = EnumTaskChannel.LINE;//params.channel;
        // task.messengerTag = params.messengerTag;
        task.lineTemplateId = params.lineTemplateId;
        // task.lineTag = params.lineTag;
        // task.lineNotificationParams = params.lineNotificationParams;
        task.startTime = moment(params.startTime).toDate();
        // task.isBindingMode = params.isBindingMode;
        // task.isReissueSMS = params.isReissueSMS;
        task.publishTitle = params.message ? params.message.title : '';
        task.publishMessage = params.message ? params.message.content : '';
        task.publicImageUrl = params.message ? params.message.imageUrl : undefined;
        task.isDeleted = false;
        task.isConfirmed = false;

        this.validateCreateTask(task);

        const newTask = await this.taskRepository.save(task);

        let tas = params.tas ? params.tas.map(data => <ICreateTaskTargetAudienceParams>{
            ...data
        }) : [];
        let taIds: number[] = [];
        if (params.taGroupId) {
            taIds = await this.getTAGroupItems(params.taGroupId);
        }

        await this.taskTargetAudienceLibSvc.bulkCreate({
            companyId: params.companyId,
            taskId: newTask.id,
            tas,
            taIds
        });

        return newTask;
    }

    private async getTAGroupItems(taGroupId: number): Promise<number[]> {
        const groupItems = await this.targetAudienceGroupItemRepository.find({
            where: { targetAudienceGroupId: taGroupId }
        });
        const ids = groupItems.map(data => data.targetAudienceId);
        return ids;
    }

    async update(params: IUpdateTaskParams): Promise<ICreateTaskResult> {
        const task = await this.findOneOrError(params.taskId);
        task.companyId = params.companyId;
        task.name = params.name;
        task.lineTemplateId = params.lineTemplateId;
        task.startTime = moment(params.startTime).toDate();
        task.publishTitle = params.message.title;
        task.publishMessage = params.message.content;

        const updateTask = await this.taskRepository.save(task);
        return updateTask;
    }

    async updateStatus(taskId: number, status: EnumTaskStatus) {
        const task = await this.findOneOrError(taskId);
        task.status = status;
        const updateTask = await this.taskRepository.save(task);
        return updateTask;
    }

    private validateCreateTask(task: TaskEntity) {
        switch (task.actionType) {
            case EnumActionType.Marketing:
                if (task.channel == EnumTaskChannel.Line_Notification ||
                    task.channel == EnumTaskChannel.Messenger_Notification) {
                    throw new AppError({ message: `Marketing not suport ${task.channel}`, code: ResultCode.clientError });
                }
                break;
            case EnumActionType.Notification:
                if (task.channel == EnumTaskChannel.LINE ||
                    task.channel == EnumTaskChannel.Messenger) {
                    throw new AppError({ message: `Notification not suport ${task.channel}`, code: ResultCode.clientError });
                }
                break;
        }
    }

    async confirm(taskId: number): Promise<IUpdateTaskResult> {
        const task = await this.findOneOrError(taskId);

        if (task.isConfirmed) {
            throw new AppError({ message: '任務已確認', code: ResultCode.clientError })
        }

        task.isConfirmed = true;
        task.status = EnumTaskStatus.Pending;

        return await this.taskRepository.save(task);
    }

    async resend(params: IResendTaskParams): Promise<IResendTaskResult> {
        const task = await this.taskRepository.findOne({
            where: {
                id: params.taskId,
                isDeleted: false
            }
        });

        if (!task) {
            throw new AppError({ message: '查無此任務', code: ResultCode.clientError })
        }
        if (task.isDeleted) {
            throw new AppError({ message: '任務已刪除', code: ResultCode.clientError })
        }
        if (task.status == EnumTaskStatus.Processing || task.status == EnumTaskStatus.Pending) {
            throw new AppError({ message: '任務執行中', code: ResultCode.clientError })
        }
        if (!task.status) {
            throw new AppError({ message: '任務未執行過', code: ResultCode.clientError })
        }

        const tas = await this.taskTargetAudienceLibSvc.findNotSendByTaskId(params.taskId);

        const newTask = await this.create({
            companyId: task.companyId,
            lineTemplateId: task.lineTemplateId,
            name: task.name + "(重傳)",
            message: {
                title: task.publishTitle,
                content: task.publishMessage,
                imageUrl: task.publicImageUrl,
            },
            startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
            tas: tas ? tas.filter(data => data.isSent == false || data.isSuccess == false).map(data =>
                <ICreateTaskTargetAudienceParams>{
                    ...data.targetAudience
                }) : []
        });

        return newTask;
    }

    async delete(taskId: number) {
        const task = await this.findOneOrError(taskId);

        if (task.status != EnumTaskStatus.Pending) {
            throw new AppError({message: '已執行，不可取消', code: ResultCode.clientError})
        }
        if (task.startTime < moment().toDate()) {
            throw new AppError({message: '已超過開始時間，不可取消', code: ResultCode.clientError})
        }

        task.isDeleted = true;
        task.status = EnumTaskStatus.Canceled;

        return await this.taskRepository.save(task);
    }
}