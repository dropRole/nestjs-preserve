import { Controller, Sse, Delete, Body } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { Privileges } from 'src/auth/privileges.decorator';
import { Privilege } from 'src/auth/enum/privilege.enum';

@Controller('sse')
export class SseController {
  constructor(private sseService: SseService) {}

  @Sse('/stream')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  sse(): Observable<{ data: any }> {
    return new Observable((subscriber) => {
      setInterval(
        () =>
          subscriber.next({ data: { updates: this.sseService.getMessages() } }),
        1000,
      );
    });
  }

  @Delete('/filter')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  filterStream(@Body('message') message: string): void {
    return this.sseService.deleteMessage(message);
  }
}
