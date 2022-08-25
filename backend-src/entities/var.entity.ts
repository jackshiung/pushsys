import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { config } from "../configuration";

@Entity('vars', { database: config.mmsDatabase.database })
export default class VarEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column("varchar", { length: 100, nullable: false })
    code: string;
    @Column("varchar", { name: 'value_str_1', length: 100, nullable: true })
    valueStr1: string;
    @Column("varchar", { name: 'value_str_2', length: 100, nullable: true })
    valueStr2: string;
    @Column("int", {name: 'value_int_1', nullable: true })
    valueInt1: number;
    @Column("int", {name: 'value_int_2', nullable: true })
    valueInt2: number;
    @Column("boolean", { name: 'is_deleted', nullable: false, default: false })
    isDeleted: boolean;
    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;
    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;
}