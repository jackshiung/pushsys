import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from "typeorm";
import { config } from "../configuration";
import CompanyEntity from "./company.entity";
import GAClientEntity from "./gaClients.entity";

@Entity('target_audiences', { database: config.mmsDatabase.database })
export default class TargetAudienceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("varchar", { length: 10, nullable: true, comment: '訂閱者電話' })
    phone: string;

    @Column("varchar", { name: 'display_name', length: 100, nullable: true, comment: 'LINE user name' })
    displayName: string;

    @Column("varchar", { name: 'line_user_id', length: 100, nullable: true, comment: 'LINE User ID' })
    @Index({ unique: true })
    lineUserId: string;

    @Column("varchar", { name: 'picture_url', length: 500, nullable: true, comment: 'LINE user 圖片超連結' })
    pictureUrl: string;

    @Column("varchar", { name: 'PSID', length: 100, nullable: true, comment: 'Messager user PSID' })
    messagerPSID: string;

    @Column("varchar", { name: 'email', length: 100, nullable: true, comment: 'Email' })
    email: string;

    @Column("boolean", { name: 'is_import', nullable: false, default: false })
    isImport: boolean;

    @Column("boolean", { name: 'is_followed', nullable: false, default: false })
    isFollowed: boolean;

    @Column("boolean", { name: 'is_deleted', nullable: false, default: true })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => CompanyEntity)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company: CompanyEntity;

    @OneToMany(type => GAClientEntity, gaClient => gaClient.targetAudience)
    gaClients: GAClientEntity[];
}