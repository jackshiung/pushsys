import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { config } from "../configuration";
import CompanyEntity from "./company.entity";

@Entity('tags', { database: config.mmsDatabase.database })
export default class TagEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("int", { name: 'task_id', nullable: false })
    taskId: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @OneToOne(type => CompanyEntity)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company: CompanyEntity;
}