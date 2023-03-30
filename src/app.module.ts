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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfigValidationSchema } from './env-config.schema';
import { TypeOrmModule } from '@nestjs/typeorm/dist';
import { DSN } from './constants';

@Module({
  imports: [
    AuthModule,
    OffereesModule,
    OfferorsModule,
    RequestsModule,
    ReservationsModule,
    ComplaintsModule,
    ProhibitionsModule,
    GeolocationModule,
    SseModule,
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
      validationSchema: EnvConfigValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: DSN.PGFactory,
    }),
  ],
})
export class AppModule {}
