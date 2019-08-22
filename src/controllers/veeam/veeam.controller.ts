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
    const result = this.veeam.getJobs(organization ? organization.office365_id : null, veeam_access_token);
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
  getSessions(@Req() req: Request) {
    const { veeam_access_token } = req['user'];
    return this.veeam.getSessions(veeam_access_token);
  }

  @Post('getOrganizationByID')
  @UseGuards(AuthGuard())
  getOrganizationByID(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { id } = body;
    return this.veeam.getOrganizationByID(id, veeam_access_token);
  }

  @Get('getOrganization')
  @UseGuards(AuthGuard())
  getOrganization(@Req() req: Request) {
    const { veeam_access_token, organization } = req['user'];
    if (organization)
      return this.veeam.getOrganizationByID(organization.office365_id, veeam_access_token);
    return this.veeam.getOrganization(veeam_access_token);
  }

  @Post('getOneDrives')
  @UseGuards(AuthGuard())
  getOneDrives(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { id } = body;
    return this.veeam.getOneDrives(id, veeam_access_token);
  }

  @Post('getOneDriveID')
  @UseGuards(AuthGuard())
  getOneDriveID(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, uid } = body;
    return this.veeam.getOneDriveID(rid, uid, veeam_access_token);
  }

  @Post('getOneDriveTree')
  @UseGuards(AuthGuard())
  getOneDriveTree(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, uid, pid, type, offset } = body;
    return this.veeam.getOneDriveTree(rid, uid, pid, type, offset, veeam_access_token);
  }

  @Post('getOneDriveParentFolder')
  @UseGuards(AuthGuard())
  getOneDriveParentFolder(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, uid, pid, type } = body;
    return this.veeam.getOneDriveParentFolder(rid, uid, pid, type, veeam_access_token);
  }

  @Post('startRestoreSession')
  @UseGuards(AuthGuard())
  startRestoreSession(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { id, json } = body;
    return this.veeam.startRestoreSession(id, json, veeam_access_token);
  }

  @Post('stopRestoreSession')
  @UseGuards(AuthGuard())
  stopRestoreSession(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { id } = body;
    return this.veeam.stopRestoreSession(id, veeam_access_token);
  }

  @Post('getMailbox')
  @UseGuards(AuthGuard())
  getMailbox(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, mid } = body;
    return this.veeam.getMailbox(rid, mid, veeam_access_token);
  }

  @Post('getMailboxes')
  @UseGuards(AuthGuard())
  getMailboxes(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid } = body;
    return this.veeam.getMailboxes(rid, veeam_access_token);
  }

  @Post('getMailboxFolders')
  @UseGuards(AuthGuard())
  getMailboxFolders(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, mid } = body;
    return this.veeam.getMailboxFolders(rid, mid, veeam_access_token);
  }

  @Post('getMailboxItems')
  @UseGuards(AuthGuard())
  getMailboxItems(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, mid, fid, offset } = body;
    return this.veeam.getMailboxItems(rid, mid, fid, offset, veeam_access_token);
  }

  @Post('getSharePointContent')
  @UseGuards(AuthGuard())
  getSharePointContent(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, sid, type } = body;
    return this.veeam.getSharePointContent(rid, sid, type, veeam_access_token);
  }

  @Post('getSharePointSites')
  @UseGuards(AuthGuard())
  getSharePointSites(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid } = body;
    return this.veeam.getSharePointSites(rid, veeam_access_token);
  }

  @Post('getSharePointTree')
  @UseGuards(AuthGuard())
  getSharePointTree(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, sid, type, pid, offset } = body;
    return this.veeam.getSharePointTree(rid, sid, type, pid, offset, veeam_access_token);
  }

  @Post('getSharePointSiteName')
  @UseGuards(AuthGuard())
  getSharePointSiteName(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, sid } = body;
    return this.veeam.getSharePointSiteName(rid, sid, veeam_access_token);
  }
}
