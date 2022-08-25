import { Entity, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, OneToOne } from "typeorm";
import { config } from "../configuration";
import TargetAudienceEntity from "./targetAudience.entity";
import TargetAudienceGroupEntity from "./targetAudienceGroup.entity";

@Entity('target_audience_group_items', { database: config.mmsDatabase.database })
export default class TargetAudienceGroupItemEntity {
    @PrimaryColumn("int", { name: 'target_audience_group_id' })
    targetAudienceGroupId: number

    @PrimaryColumn("int", { name: 'target_audience_id' })
    targetAudienceId: number;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => TargetAudienceGroupEntity, targetAudienceGroup => targetAudienceGroup.targetAudienceGroupItems)
    @JoinColumn({ name: 'target_audience_group_id', referencedColumnName: 'id' })
    targetAudienceGroup: TargetAudienceGroupEntity;

    @ManyToOne(type => TargetAudienceEntity)
    @JoinColumn({ name: 'target_audience_id', referencedColumnName: 'id' })
    targetAudience: TargetAudienceEntity;
    
}