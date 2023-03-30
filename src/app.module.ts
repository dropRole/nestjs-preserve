import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OffereesModule } from './offerees/offerees.module';
import { OfferorsModule } from './offerors/offerors.module';
import { RequestsModule } from './requests/requests.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ProhibitionsModule } from './prohibitions/prohibitions.module';
import { GeolocationModule } from './geolocation/geolocation.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [AuthModule, OffereesModule, OfferorsModule, RequestsModule, ReservationsModule, ComplaintsModule, ProhibitionsModule, GeolocationModule, SseModule]
})
export class AppModule {}
