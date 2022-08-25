import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { config } from "../configuration";
import TaskEntity, { EnumTaskChannel } from "./task.entity";

@Entity('task_read', { database: config.mmsDatabase.database })
export default class TaskReadEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'task_id', nullable: false })
    taskId: number;

    @Column("varchar", { name: 'channel', length: 100, nullable: false })
    channel: EnumTaskChannel;

    @Column("int", { name: 'target_audience_id', nullable: false })
    targetAudienceId: number;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @ManyToOne(type => TaskEntity)
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    task: TaskEntity;
}