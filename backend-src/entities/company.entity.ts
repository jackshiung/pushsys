import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { config } from "../configuration";

@Entity('companies', { database: config.mmsDatabase.database })
export default class CompanyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}