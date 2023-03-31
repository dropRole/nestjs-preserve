import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtModuleOptions } from '@nestjs/jwt';

export const DSN: {
  PGFactory: (configService: ConfigService) => Promise<TypeOrmModuleOptions>;
} = {
  PGFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get('PG_HOST'),
    port: configService.get('PG_PORT'),
    database: configService.get('PG_DB'),
    username: configService.get('PG_USER'),
    password: configService.get('PG_PASS'),
    autoLoadEntities: true,
    synchronize: process.env.STAGE === 'dev' ? true : false,
  }),
};

export const JWTFactory: (
  configService: ConfigService,
) => Promise<JwtModuleOptions> = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.get('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRATION'),
  },
});
