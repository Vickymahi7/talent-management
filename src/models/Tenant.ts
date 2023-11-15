import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
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
  tenant_type_id?: number;

  @Column()
  tenant_status_id?: number;

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

  @OneToOne(() => User, (user) => user.tenant)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
