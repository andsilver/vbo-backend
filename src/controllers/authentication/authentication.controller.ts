import { Controller, Post, Body, UseGuards, Req, Query, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import * as uuid from 'uuid/v1';

import { VeeamApi } from '../../core/external/veeam-api';
import { User } from '../../typeorm';
import { OrganizationService, UserService } from '../../typeorm';
import { AuthService } from '../../core/services/auth.service';
import { Sendgrid } from '../../core/external/sendgrid';

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private veeam: VeeamApi,
    private userService: UserService,
    private orgService: OrganizationService,
    private authService: AuthService,
    private sendgrid: Sendgrid
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { access_token } = await this.veeam.login();
    let { account, organization } = body;
    if (organization) {
      const res = await this.veeam.addOrganization(organization, access_token);
      const { name, id, type } = res;
      organization = await this.orgService.create(name, id, type);
    }
    let user = new User();
    if (organization) {
      user.organization = organization;
      user.role = 'admin';
    } else user.role = 'user';
    user.email = account.email;
    user.password = account.password;
    user = await this.userService.save(user);
    return user;
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request) {
    const { access_token, refresh_token } = await this.veeam.login();
    return this.authService.login(req['user'], access_token, refresh_token);
  }

  @Post('invite')
  @UseGuards(AuthGuard())
  async invite(@Body() body, @Req() req: Request) {
    const { email } = body;
    const orgId = req['user'].organization.id;
    const organization = await this.orgService.findById(orgId);
    const user = new User();
    user.email = email;
    user.invited = true;
    user.role = 'user';
    user.invite_token = uuid();
    user.organization = organization;
    await this.userService.save(user);
    await this.sendgrid.sendInviteEmail(user.email, user.invite_token);
    return { success: true };
  }

  @Get('check-invite')
  async checkInvite(@Query('id') id) {
    const user = await this.userService.findOne({ where: { invite_token: id } });
    return { user };
  }

  @Post('cancel-invite')
  async cancelInvite(@Body() body: any) {
    const { email } = body;
    const user = await this.userService.findOne({ where: { email } });
    await this.userService.remove(user);
    return { success: true };
  }

  @Post('accept-invite')
  async acceptInvite(@Body() body: any) {
    const { username, password } = body;
    const user = await this.userService.findOne({ where: { email: username } });
    user.password = password;
    user.invite_token = null;
    user.invited = false;
    await this.userService.save(user);
    return { success: true };
  }
}
