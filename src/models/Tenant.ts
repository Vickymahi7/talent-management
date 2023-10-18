import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export default class Tenant {

  @PrimaryGeneratedColumn()
  tenant_id?: number;

  @Column()
  name?: string;

  @Column()
  tenant_type_id?: string;

  @Column()
  description?: string;

  @Column()
  location?: string;

  @Column()
  active?: boolean;

  @Column()
  created_by_id?: number;

  @CreateDateColumn()
  created_dt?: Date;

  @UpdateDateColumn()
  last_updated_dt?: Date;
}