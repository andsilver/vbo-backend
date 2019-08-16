import { Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { ConfigService } from '../services/config.service';

@Injectable()
export class Sendgrid {
  sendgrid: any;

  constructor(private config: ConfigService) {
    this.sendgrid = sendgrid;
    sendgrid.setApiKey(this.config.get('SEND_GRID_API_KEY'));
  }

  sendInviteEmail(email: string, uuid: string) {
    const msg = {
      to: email,
      from: 'no-reply@veeambackup.com',
      subject: 'Invitation to Veeam backup for Office 365',
      html: `
        <h3>Welcome</h3>
        <div>Click this <a href="http://${this.config.get('FRONTEND')}/invite/${uuid}">link</a> to accept invite</div>
      `
    };
    return sendgrid.send(msg);
  }
}
