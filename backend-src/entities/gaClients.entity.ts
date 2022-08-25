import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, PrimaryColumn, ManyToOne } from "typeorm";
import { config } from "../configuration";
import TargetAudienceEntity from "./targetAudience.entity";

@Entity('ga_clients', { database: config.mmsDatabase.database })
export default class GAClientEntity {
    @PrimaryColumn("varchar", { name: 'client_id', length: 100, nullable: false })
    clientId: string;

    @Column("int", { name: 'target_audience_id', nullable: true })
    targetAudienceId: number;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @ManyToOne(type => TargetAudienceEntity, targetAudience => targetAudience.gaClients)
    @JoinColumn({ name: 'target_audience_id', referencedColumnName: 'id' })
    targetAudience: TargetAudienceEntity;
}