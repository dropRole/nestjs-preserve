import { Exclude } from 'class-transformer';
import { Complaint } from 'src/complaints/complaint.entity';
import { Entity, PrimaryColumn, Column, OneToMany, Check } from 'typeorm';
import { Privilege } from './enum/privilege.enum';

@Entity('accounts')
export class Account {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  username: string;

  @Column({ type: 'varchar', length: 64 })
  @Exclude()
  pass: string;

  @Column({ type: 'varchar', length: 9 })
  @Check("privilege IN('SUPERUSER', 'OFFEREE', 'OFFEROR')")
  privilege: Privilege;

  @OneToMany((_type) => Complaint, (complaint) => complaint.account, {
    eager: false,
  })
  complaints: Complaint[];
}
