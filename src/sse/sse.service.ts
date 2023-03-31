import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule/dist';
import { SSECause } from './enum/sse-cause.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SseService {
  private messages: any[];

  constructor() {
    this.messages = [];
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  collectGarbageMessages() {
    this.messages.forEach((message) => {
      const millDiff: number = new Date().getTime() - message.pushed.getTime();

      const dayDiff: number = Math.floor(millDiff / (1000 * 60 * 60 * 24));

      // message is older than 5 days
      if (dayDiff > 5) this.deleteMessage(message);
    });
  }

  getMessages() {
    return this.messages;
  }

  private pushMessage(value: any) {
    value.id = uuidv4();
    value.pushed = new Date();
    this.messages.push(value);
  }

  deleteMessage(message: string): void {
    this.messages = this.messages.filter(
      (storedMessage) => !(storedMessage.id === JSON.parse(message).id),
    );
  }

  @OnEvent('notify', { async: true })
  message(value: any) {
    let found: any | undefined = undefined;

    switch (value.cause) {
      case SSECause.REPUTATION_ALTERATION:
        // any sse message
        if (this.messages.length) {
          found = this.messages.find(
            (message) =>
              message.cause === SSECause.REPUTATION_ALTERATION &&
              message.recipient === value.recipient,
          );

          // previous redundant notification waiting to be pushed
          if (found) this.deleteMessage(JSON.stringify(found));
        }

        this.pushMessage(value);

        break;

      case 'REQUEST_WITHDRAWAL':
        found = this.messages.find(
          (message) =>
            message.cause === SSECause.RESERVATION_REQUEST &&
            message.request.id === value.request.id,
        );

        // previous redundant notification waiting to be pushed
        if (found) this.deleteMessage(JSON.stringify(found));

        break;

      case SSECause.RESERVATION_WITHDRAWAL:
        // any sse message
        if (this.messages.length) {
          found = this.messages.find(
            (message) =>
              message.cause === SSECause.RESERVATION_CONFIRMATION &&
              message.reservation.id === value.reservation.id,
          );

          // redundant notification waiting to be pushed
          if (found) {
            this.deleteMessage(JSON.stringify(found));

            return;
          }
        }

        this.pushMessage(value);

        break;

      case 'COMPLAINT_WITHDRAWAL':
        // any message
        if (this.messages.length) {
          found = this.messages.find(
            (message) =>
              (message.cause === SSECause.COMPLAINT_SUBMISSION ||
                message.cause === SSECause.COUNTER_COMPLAINT_SUBMISSION) &&
              message.complaint.id === value.complaint.id,
          );

          // redundant notification waiting to be pushed
          if (found) {
            this.deleteMessage(JSON.stringify(found));

            return;
          }
        }

        this.pushMessage(value);

        break;

      case SSECause.PROHIBITION_TIMEFRAME_UPDATE:
        // any message
        if (this.messages.length) {
          found = this.messages.filter(
            (message) =>
              message.cause === SSECause.PROHIBITION_TIMEFRAME_UPDATE &&
              message.recipient === value.recipient &&
              message.prohibition.id === value.prohibition.id,
          );

          // redundant notification waiting to be pushed
          if (found)
            found.forEach((message: any) =>
              this.deleteMessage(JSON.stringify(message)),
            );
        }

        this.pushMessage(value);

        break;

      case SSECause.PROHIBITION_CONCLUSION:
        // any message
        if (this.messages.length) {
          found = this.messages.filter(
            (message) =>
              message.cause === SSECause.PROHIBITION_TIMEFRAME_UPDATE &&
              message.recipient === value.recipient &&
              message.prohibition.id === value.prohibition.id,
          );

          // redundant notification waiting to be pushed
          if (found)
            found.forEach((message: any) =>
              this.deleteMessage(JSON.stringify(message)),
            );

          found = this.messages.filter(
            (message) =>
              message.cause === SSECause.PROHIBITION_DETERMINATION &&
              message.recipient === value.recipient &&
              message.prohibition.id === value.prohibition.id,
          );

          // redundant notification waiting to be pushed
          if (found) {
            found.forEach((message: any) =>
              this.deleteMessage(JSON.stringify(message)),
            );

            return;
          }
        }

        this.pushMessage(value);

        break;

      default:
        this.pushMessage(value);
    }
  }
}
