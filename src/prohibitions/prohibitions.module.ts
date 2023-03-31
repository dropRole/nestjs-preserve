import { Module } from '@nestjs/common';
import { ProhibitionsController } from './prohibitions.controller';
import { ProhibitionsService } from './prohibitions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prohibition } from './prohibition.entity';
import { BullModule } from '@nestjs/bull';
import { OffereesModule } from 'src/offerees/offerees.module';
import { OfferorsModule } from 'src/offerors/offerors.module';
import { ProhibitionConsumer } from './prohibition-processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prohibition]),
    BullModule.registerQueue({ name: 'PROHIBITIONS' }),
    OffereesModule,
    OfferorsModule,
  ],
  controllers: [ProhibitionsController],
  providers: [ProhibitionsService, ProhibitionConsumer],
})
export class ProhibitionsModule {}
