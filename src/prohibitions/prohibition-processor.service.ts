import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Prohibition } from './prohibition.entity';
import { Repository } from 'typeorm';
import { InternalServerErrorException } from '@nestjs/common/exceptions';

@Processor('PROHIBITIONS')
export class ProhibitionConsumer {
  constructor(
    @InjectRepository(Prohibition)
    private prohibitionRepository: Repository<Prohibition>,
    private eventEmitter2: EventEmitter2,
  ) {}

  @Process('PROHIBITION_CONCLUDE')
  async concludeProhibition(job: Job) {
    try {
      await this.prohibitionRepository.delete(job.data.prohibition.id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'PROHIBITION_CONCLUSION',
      recipient: job.data.username,
      prohibition: job.data.prohibition,
    });
  }
}
