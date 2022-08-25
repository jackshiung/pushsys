import { config } from "../configuration";
import { Entity, Column, CreateDateColumn, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('task_error_log', { database: config.logDatabase.database, schema: 'jj_mms_log' })
export default class TaskErrorLogEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column("int", { name: 'task_id' })
    taskId: number;

    @Column("int", { name: 'target_audience_id' })
    targetAudienceId: number;

    @Column("varchar", { name: 'code', length: 100, nullable: true })
    code: string;

    @Column("text", { name: 'message', nullable: true })
    message: string;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;
}