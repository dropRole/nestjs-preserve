import { Process, Processor } from '@nestjs/bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from 'bull';

@Processor('JWT')
export class JWTConsumer {
  constructor(private eventEmitter2: EventEmitter2) {}

  @Process('JWT_EXPIRE')
  async expireJWT(job: Job) {
    this.eventEmitter2.emit('notify', {
      cause: 'JWT_EXPIRATION',
      recipient: job.data.username,
      jwt: job.data.accessToken,
    });
  }
}
