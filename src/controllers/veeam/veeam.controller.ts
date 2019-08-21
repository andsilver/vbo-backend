import { Controller, Post, Body, Res, UseGuards, Req, Get, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { VeeamApi } from '../../core/external/veeam-api';

@Controller('veeam')
export class VeeamController {
  constructor(
    private veeam: VeeamApi,
  ) { }

  @Get('jobs')
  @UseGuards(AuthGuard())
  getJobs(@Req() req: Request) {
    const { veeam_access_token, organization } = req['user'];
    const result = this.veeam.getJobs(organization ? organization.org_id : null, veeam_access_token);
    return result;
  }

  @Get('jobs/:id/job-sessions')
  @UseGuards(AuthGuard())
  getJobSessions(@Req() req: Request, @Param('id') id) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getJobSessions(id, veeam_access_token);
  }

  @Get('organizations')
  @UseGuards(AuthGuard())
  getOrganizations(@Req() req: Request) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getOrganizations(veeam_access_token);
  }

  @Get('job-sessions/:id/log-items')
  @UseGuards(AuthGuard())
  getBackupSessionLog(@Req() req: Request, @Param('id') id) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getBackupSessionLog(id, veeam_access_token);
  }

  @Post('startJob')
  @UseGuards(AuthGuard())
  startJob(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    return this.veeam.startJob(body.id, veeam_access_token);
  }

  @Post('stopJob')
  @UseGuards(AuthGuard())
  stopJob(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    return this.veeam.stopJob(body.id, veeam_access_token);
  }

  @Post('changeJobState')
  @UseGuards(AuthGuard())
  changeJobState(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { id, json } = body;
    return this.veeam.changeJobState(id, json, veeam_access_token);
  }

  @Get('getProxies')
  @UseGuards(AuthGuard())
  getProxies(@Req() req: Request) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getProxies(veeam_access_token);
  }

  @Get('getBackupRepositories')
  @UseGuards(AuthGuard())
  getBackupRepositories(@Req() req: Request) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getBackupRepositories(veeam_access_token);
  }

  @Get('getLicenseInfo/:orgId')
  @UseGuards(AuthGuard())
  getLicenseInfo(@Req() req: Request, @Param('orgId') id) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getLicenseInfo(id, veeam_access_token);
  }

  @Get('getLicensedUsers/:orgId')
  @UseGuards(AuthGuard())
  getLicensedUsers(@Req() req: Request, @Param('orgId') id) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getLicensedUsers(id, veeam_access_token);
  }

  @Get('getOrganizationRepositories/:orgId')
  @UseGuards(AuthGuard())
  getOrganizationRepositories(@Req() req: Request, @Param('orgId') id) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getOrganizationRepositories(id, veeam_access_token);
  }

  @Post('getUserData')
  @UseGuards(AuthGuard())
  getUserData(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { repoId, userId } = body;
    return this.veeam.getUserData(repoId, userId, veeam_access_token);
  }

  @Get('getSessions')
  @UseGuards(AuthGuard())
  getSessions(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getSessions(veeam_access_token);
  }
}
