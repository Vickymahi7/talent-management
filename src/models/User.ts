import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export default class User {

  @PrimaryGeneratedColumn()
  user_id?: number;

  @Column()
  tenant_id?: number;

  @Column()
  user_type_id?: number;

  @Column()
  user_name?: string;

  @Column()
  password?: string;

  @Column()
  email_id?: string;

  @Column()
  authtoken?: string;

  @Column()
  user_status_id?: number;

  @Column()
  active?: boolean;

  @Column()
  created_by_id?: number;

  @CreateDateColumn()
  created_dt?: Date;

  @Column()
  last_access?: Date;

  @UpdateDateColumn()
  last_updated_dt?: Date;
}