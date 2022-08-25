import { Entity, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { config } from "../configuration";
import TargetAudienceGroupItemEntity from "./targetAudienceGroupItem.entity";

export enum EnumSourceType {
    API = "api", //CDP
    WEB = 'web' //Web後台
}

@Entity('target_audience_groups', { database: config.mmsDatabase.database })
export default class TargetAudienceGroupEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("enum", {
        name: "source_type",
        nullable: true,
        comment: '資料建立來源',
        enum: EnumSourceType
    })
    sourceType: EnumSourceType;

    @Column("int", { name: 'ta_count', nullable: true, default: 0 })
    taCount: number;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @OneToMany(type => TargetAudienceGroupItemEntity, targetAudienceGroupItem => targetAudienceGroupItem.targetAudienceGroup)
    targetAudienceGroupItems: TargetAudienceGroupItemEntity[];

}