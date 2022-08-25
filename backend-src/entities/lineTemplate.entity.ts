import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { config } from "../configuration";
import CompanyEntity from "./company.entity";

export enum EnumTemplate {
    None = 'none',
    Text = 'text',
    Image = 'image',
    ImagemapCustom = 'imagemapCustom',
    ImagemapSquare = 'imagemapSquare',
    Imagemap1x2 = 'imagemap1x2',
    Imagemap2x1 = 'imagemap2x1',
    Imagemap3x1 = 'imagemap3x1',
    Imagemap2x2 = 'imagemap2x2',
    Imagemap1n2Col = 'imagemap1n2Col',
    Imagemap1n2Row = 'imagemap1n2Row',
    Imagemap2x3 = 'imagemap2x3',
    ImageCarousel = 'imageCarousel',
    CardtypeProduct = 'cardtypeProduct',
    CardtypePlace = 'cardtypePlace',
    CardtypePerson = 'cardtypePerson',
    Video = 'video'
}

@Entity('line_templates', { database: config.mmsDatabase.database })
export default class LineTemplateEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", { name: 'company_id', nullable: false, comment: '公司' })
    companyId: number;

    @Column("varchar", { name: 'name', length: 100, nullable: false })
    name: string;

    @Column("enum", {
        name: "template",
        nullable: false,
        comment: '樣板',
        enum: EnumTemplate
    })
    template: EnumTemplate;

    @Column("text", { name: 'data', nullable: true })
    data: string;

    @Column("boolean", { name: 'is_deleted', nullable: true, default: false })
    isDeleted: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createDate: Date;

    @UpdateDateColumn({ name: 'update_date' })
    updateDate: Date;

    @ManyToOne(type => CompanyEntity)
    @JoinColumn({ name: 'company_id', referencedColumnName: 'id' })
    company: CompanyEntity;
}