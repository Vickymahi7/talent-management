import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import UserMenuPrivilege from "./UserMenuPrivilege";

@Entity()
export default class StandardMenu {
  @PrimaryGeneratedColumn()
  standard_menu_id?: number;

  @Column()
  main_menu_id?: number;

  @Column()
  main_menu?: string;

  @Column()
  menu?: string;

  @Column()
  web_url?: string;

  @Column()
  icon?: string;

  @Column()
  menu_order?: number;

  @Column()
  sad?: boolean;

  @Column()
  adm?: boolean;

  @Column()
  hru?: boolean;

  @Column()
  usr?: boolean;

  @Column()
  active?: boolean;

  @CreateDateColumn()
  created_dt?: Date;

  @UpdateDateColumn()
  last_updated_dt?: Date;

  @OneToOne(
    () => UserMenuPrivilege,
    (user_menu_privilege) => user_menu_privilege.standard_menu
  )
  @JoinColumn({ name: "standard_menu_id" })
  user_menu_privilege!: UserMenuPrivilege;
}
