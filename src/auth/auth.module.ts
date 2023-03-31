import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTFactory } from 'src/constants';
import { JWTStrategy } from './jwt.strategy';
import { BullModule } from '@nestjs/bull';
import { OffereesModule } from 'src/offerees/offerees.module';
import { OfferorsModule } from 'src/offerors/offerors.module';
import { JWTConsumer } from './jwt-processor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: JWTFactory,
    }),
    BullModule.registerQueue({ name: 'JWT' }),
    OffereesModule,
    OfferorsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTStrategy, JWTConsumer],
  exports: [JWTStrategy],
})
export class AuthModule {}
