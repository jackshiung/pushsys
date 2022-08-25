import { JoinColumn, ManyToOne } from "typeorm";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { config } from "../configuration";
import CompanyEntity from "./company.entity";

@Entity('users', { database: config.mmsDatabase.database })
export default class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("varchar", { name: 'account', length: 100, nullable: false })
    account: string;

    @Column("varchar", { name: 'password', length: 100, nullable: false })
    password: string;

    @Column("boolean", { name: 'is_deleted', nullable: false, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => CompanyEntity)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company: CompanyEntity;
}