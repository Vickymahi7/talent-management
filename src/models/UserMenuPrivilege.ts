import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import StandardMenu from "./StandardMenu";
import User from "./User";

@Entity()
export default class UserMenuPrivilege {
  @PrimaryGeneratedColumn()
  user_menu_privilege_id?: number;

  @Column()
  tenant_id?: number;

  @Column()
  user_id?: number;

  @Column()
  standard_menu_id?: number;

  @Column()
  menu_order?: number;

  @Column()
  active?: boolean;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_dt?: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  last_updated_dt?: Date;

  @OneToOne(() => User, (user) => user.user_menu_privilege)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToOne(
    () => StandardMenu,
    (standard_menu) => standard_menu.user_menu_privilege
  )
  @JoinColumn({ name: "standard_menu_id" })
  standard_menu!: StandardMenu;
}
