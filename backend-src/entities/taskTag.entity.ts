import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { config } from "../configuration";
import TaskEntity from "./task.entity";

@Entity('task_tags', { database: config.mmsDatabase.database })
export default class TaskTagEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'task_id', nullable: false })
    taskId: number;

    @Column("int", { name: 'expiration_days', nullable: false })
    expirationDays: number;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @ManyToOne(type => TaskEntity, task => task.taskTags)
    @JoinColumn({ name: 'task_id', referencedColumnName: 'id' })
    task: TaskEntity;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}