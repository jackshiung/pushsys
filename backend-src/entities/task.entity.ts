import { OneToMany } from "typeorm";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { config } from "../configuration";
import CompanyEntity from "./company.entity";
import LandingPageEntity from "./landingPage.entity";
import TaskTagEntity from "./taskTag.entity";
import TaskTargetAudienceEntity from "./taskTargetAudience.entity";

export enum EnumActionType {
    Marketing = "marketing",
    Notification = "notification"
}

export enum EnumTaskChannel {
    SMS = "SMS",
    LINE = "line",
    Messenger = "messenger",
    Line_Notification = "lineNotification",
    Messenger_Notification = "messengerNotification",
    Interaction = "interaction",
    CostSaving = "costSaving"
}

export enum EnumTaskStatus {
    Processing = "processing",
    Completed = "completed",
    Pending = 'pending',
    Canceled = 'canceled'
}

@Entity('tasks', { database: config.mmsDatabase.database })
export default class TaskEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("datetime", { name: 'start_time', nullable: true, comment: '開始時間' })
    startTime: Date;

    @Column("enum", {
        name: "action_type",
        nullable: false,
        comment: '發送型式',
        enum: EnumActionType
    })
    actionType: EnumActionType;

    @Column("enum", {
        name: "channel",
        nullable: false,
        comment: '發送渠道',
        enum: EnumTaskChannel
    })
    channel: EnumTaskChannel;

    @Column("varchar", {
        name: "messenger_tag",
        length: 100,
        nullable: true,
        comment: 'messenger推播tag',
    })
    messengerTag: string;

    @Column("int", {
        name: "line_template_id",
        nullable: true,
        comment: 'line樣板'
    })
    lineTemplateId: number;

    @Column("varchar", {
        name: "line_tag",
        length: 100,
        nullable: true,
        comment: 'line推播tag'
    })
    lineTag: string;

    @Column("text", { name: 'line_notification_params', nullable: true })
    lineNotificationParams: string;

    @Column("boolean", { name: 'is_binding_mode', nullable: true, default: false, comment: '是否開啟綁定功能' })
    isBindingMode: boolean;

    @Column("boolean", { name: 'is_reissue_SMS', nullable: true, default: false, comment: '是否補發SMS' })
    isReissueSMS: boolean;

    @Column("varchar", { name: 'publish_title', length: 300, nullable: false, comment: '訊息標題' })
    publishTitle: string;

    @Column("varchar", { name: 'publish_message', length: 300, nullable: false, comment: '訊息內容' })
    publishMessage: string;

    @Column("varchar", { name: 'public_image_url', length: 500, nullable: true, comment: '訊息圖片連結' })
    publicImageUrl: string;

    @Column("enum", {
        name: "status",
        nullable: true,
        comment: '狀態',
        enum: EnumTaskStatus
    })
    status: EnumTaskStatus;

    @Column("boolean", { name: 'is_confirmed', nullable: true, default: false, comment: '已確認' })
    isConfirmed: boolean;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => CompanyEntity)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company: CompanyEntity;

    @OneToMany(type => LandingPageEntity, landingPage => landingPage.task)
    landingPage: LandingPageEntity;

    @OneToMany(type => TaskTagEntity, taskTag => taskTag.task)
    taskTags: TaskTagEntity[];

    @OneToMany(type => TaskTargetAudienceEntity, taskTargetAudience => taskTargetAudience.task)
    taskTargetAudiences: TaskTargetAudienceEntity[];
}