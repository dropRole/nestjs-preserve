import { Account } from 'src/auth/account.entity';
import { Reservation } from 'src/reservations/reservation.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('complaints')
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp', default: 'NOW' })
  written: string;

  @Column({ type: 'timestamp', nullable: true })
  updated: string;

  @OneToOne((_type) => Complaint, {
    nullable: true,
    onDelete: 'RESTRICT',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'idCounteredComplaint', referencedColumnName: 'id' })
  counteredComplaint: Complaint;

  @ManyToOne((_type) => Reservation, (reservation) => reservation.complaints)
  @JoinColumn({ name: 'idReservations', referencedColumnName: 'id' })
  reservation: Reservation;

  @ManyToOne((_type) => Account, (account) => account.complaints, {
    eager: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'author', referencedColumnName: 'username' })
  account: Account;
}
