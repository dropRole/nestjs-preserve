import * as JOI from 'joi';

export const EnvConfigValidationSchema = JOI.object({
  PORT: JOI.number().required(),
  PG_HOST: JOI.string().required(),
  PG_PORT: JOI.number().required(),
  PG_DB: JOI.string().required(),
  PG_USER: JOI.string().required(),
  PG_PASS: JOI.string().required(),
  REDIS_HOST: JOI.string().required(),
  REDIS_PORT: JOI.number().required(),
  JWT_SECRET: JOI.string().required(),
  JWT_EXPIRATION: JOI.number().required(),
  SUPERUSER: JOI.string().required(),
  SUPERUSER_PASS: JOI.string().required(),
  LOCATIONIQ_API_KEY: JOI.string().required(),
});
