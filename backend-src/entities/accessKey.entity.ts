import { config } from "../configuration";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from "typeorm";
import CompanyEntity from "./company.entity";

@Entity('access_keys', { database: config.mmsDatabase.database  })
export default class AccessKeysEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("varchar", { name: 'key', length: 128, nullable: false })
    key: string;

    @Column("varchar", { name: 'secret', length: 128, nullable: false })
    secret:string;

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