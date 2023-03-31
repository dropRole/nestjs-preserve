import { Controller, Sse, Delete, Body } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';

@Controller('sse')
export class SseController {
  constructor(private sseService: SseService) {}

  @Sse('/stream')
  sse(): Observable<{ data: any }> {
    return;
  }

  @Delete('/filter')
  filterStream(@Body('message') message: string): void {
    return;
  }
}
