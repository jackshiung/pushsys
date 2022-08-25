import { JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { config } from "../configuration";
import TaskEntity from "./task.entity";

@Entity('landing_pages', { database: config.mmsDatabase.database })
export default class LandingPageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'task_id', nullable: false })
    taskId: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false, comment: '活動名稱' })
    title: string;

    @Column("varchar", { name: 'logo_image_url', length: 500, nullable: false, comment: 'Logo圖片連結' })
    logoImageUrl: string;

    @Column("varchar", { name: 'banner_image_url', length: 500, nullable: false, comment: 'Banner圖片連結' })
    bannerImageUrl: string;

    @Column("varchar", { length: 300, nullable: false, comment: '活動說明' })
    description: string;

    @Column("boolean", { name: 'is_deleted', nullable: false, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @OneToOne(type => TaskEntity, task => task.landingPage)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    task: TaskEntity;
}