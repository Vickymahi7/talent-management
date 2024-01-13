import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import User from "./User";

@Entity()
export default class Tenant {
  @PrimaryGeneratedColumn()
  tenant_id?: number;

  @Column()
  user_id?: number;

  @Column()
  name?: string;

  @Column()
  tenant_phone?: string;

  @Column()
  tenant_email_id?: string;

  @Column()
  tenant_type_id?: number;

  @Column()
  tenant_status_id?: number;

  @Column()
  description?: string;

  @Column()
  location?: string;

  @Column()
  logo_url?: string;

  @Column()
  is_official_contact_info?: boolean;

  @Column()
  is_skill_experience?: boolean;

  @Column()
  active?: boolean;

  @Column()
  created_by_id?: number;

  @CreateDateColumn()
  created_dt?: Date;

  @UpdateDateColumn()
  last_updated_dt?: Date;

  @OneToOne(() => User, (user) => user.tenant)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
