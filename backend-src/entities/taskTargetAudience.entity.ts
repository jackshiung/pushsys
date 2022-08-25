import { Entity, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { config } from "../configuration";
import TargetAudienceEntity from "./targetAudience.entity";
import TaskEntity from "./task.entity";

export enum EnumTaskTargetAudienceChannel {
    SMS = "SMS",
    Line = "line",
    Messenger = "messenger",
    Line_Notification = "lineNotification",
    Messenger_Notification = "messengerNotification"
}

@Entity('task_target_audiences', { database: config.mmsDatabase.database })
export default class TaskTargetAudienceEntity {
    @PrimaryColumn("int", { name: 'task_id' })
    taskId: number;

    @PrimaryColumn("int", { name: 'target_audience_id' })
    targetAudienceId: number;

    @Column("varchar", { name: 'code', length: 10, nullable: false })
    code: string;

    @Column("enum", {
        name: "channel",
        nullable: false,
        comment: '發送渠道',
        enum: EnumTaskTargetAudienceChannel
    })
    channel: EnumTaskTargetAudienceChannel;

    @Column("boolean", { name: 'is_sent', default: false, nullable: false })
    isSent: boolean;

    @Column("boolean", { name: 'is_success', default: false, nullable: false })
    isSuccess: boolean;

    @Column("boolean", { name: 'is_export', nullable: true, comment: '是否上傳, null:為未讀未點擊' })
    isExport: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => TaskEntity, task => task.taskTargetAudiences)
    @JoinColumn({ name: "task_id", referencedColumnName: 'id' })
    task: TaskEntity;

    @ManyToOne(type => TargetAudienceEntity)
    @JoinColumn({ name: "target_audience_id", referencedColumnName: 'id' })
    targetAudience: TargetAudienceEntity;
}