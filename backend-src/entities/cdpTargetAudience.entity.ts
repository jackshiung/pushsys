import { config } from "../configuration";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from "typeorm";
import CompanyEntity from "./company.entity";

@Entity('cdp', { database: config.mmsDatabase.database })
export default class CDPTargetAudienceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { name: 'platform', comment: "line" })
    platform: string;

    @Column("varchar", { name: 'page_id', comment: "LINE帳號ID" })
    pageId: string;

    @Column("varchar", { name: 'bot_id', comment: "CHATISFY BOT ID" })
    botId: string;

    @Column("varchar", { name: 'last_name', nullable: true })
    lastName: string;

    @Column("varchar", { name: 'psid', comment: "用戶的LINE ID" })
    psid: string;

    @Column("varchar", { name: 'first_name', length: 100, comment: "用戶LINE顯示名稱" })
    firstName: string;

    @Column("varchar", { name: 'profile_pic', length: 1000, comment: "用戶頭像URL" })
    profilePic: string;

    @Column("varchar", { name: 'locale', length: 100, nullable: true })
    locale: string;

    @Column("varchar", { name: 'timezone', length: 100, nullable: true })
    timezone: string;

    @Column("varchar", { name: 'gender', length: 50, nullable: true, comment: "性別", })
    gender: string;

    @Column("varchar", { name: 'tag', length: 200, nullable: true, comment: "CHATISFY tag", })
    tag: string;

    @Column("boolean", { name: 'is_export', default: false, comment: '是否上傳' })
    isExport: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;
}