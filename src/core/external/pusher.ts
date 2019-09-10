import * as Pusher from 'pusher';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../services/config.service';

@Injectable()
export class PusherService {

  instance: Pusher;

  constructor(private config: ConfigService) {
    this.instance = new Pusher({
      ...this.config.get('PUSHER') as any
    });
  }

  async emit(channel: string, event: string, data: any) {
    return new Promise((resolve, reject) => {
      this.instance.trigger(channel, event, data, error => {
        if (error)
          reject(error);
        resolve();
      });
    });
  };

  sharePointRestoreFinished(message: object) {
    this.emit('SHAREPOINT', 'RESTORE_FINISHED', message);
  }
}
