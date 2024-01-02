import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Tenant from "./Tenant";
import UserMenuPrivilege from "./UserMenuPrivilege";

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
  phone?: string;

  @Column()
  photo_url?: string;

  @Column()
  access_token?: string;

  @Column()
  activation_token?: string;

  @Column()
  user_status_id?: number;

  @Column()
  active?: boolean;

  @Column()
  created_by_id?: number;

  @Column()
  last_access?: Date;

  @CreateDateColumn()
  created_dt?: Date;

  @UpdateDateColumn()
  last_updated_dt?: Date;

  @OneToOne(() => Tenant, (tenant) => tenant.user)
  @JoinColumn({ name: "user_id" })
  tenant!: Tenant;

  @OneToOne(
    () => UserMenuPrivilege,
    (userMenuPrivilege) => userMenuPrivilege.user
  )
  @JoinColumn({ name: "user_id" })
  user_menu_privilege!: UserMenuPrivilege;
}
