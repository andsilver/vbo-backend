import { Controller, Post, Body, Res, UseGuards, Req, Get, Param, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

import { VeeamApi } from '../../core/external/veeam-api';
import { ConfigService } from '../../core/services/config.service';

@Controller('veeam')
export class VeeamController {
  constructor(
    private veeam: VeeamApi,
    private config: ConfigService
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

  @Post('getRestoreSessionForOrganization')
  @UseGuards(AuthGuard())
  getRestoreSessionForOrganization(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid } = body;
    return this.veeam.getRestoreSessionForOrganization(rid, veeam_access_token);
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
    return this.veeam.getOneDriveTree(rid, uid, type, pid, offset, veeam_access_token);
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
    const { veeam_access_token, organization } = req['user'];
    let { id, json } = body;
    if (id === 'tenant')
      id = organization.office365_id;
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
    const { rid, mid, fid, name, offset } = body;
    return this.veeam.getMailboxItems(rid, mid, fid, name, offset, veeam_access_token);
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

  @Post('getSharePointListName')
  @UseGuards(AuthGuard())
  getSharePointListName(@Req() req: Request, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { rid, sid, cid, type } = body;
    return this.veeam.getSharePointListName(rid, sid, type, cid, veeam_access_token);
  }

  @Post('actions')
  @UseGuards(AuthGuard())
  async actions(@Req() req: Request, @Res() res: Response, @Body() body) {
    const { veeam_access_token } = req['user'];
    const { action, rid, sid, mid, iid, uid, json, type } = body;

    if (json && json.hasOwnProperty('restoreTo'))
      json.restoreTo = { ...json.restoreTo, ...this.config.get('CREDENTIAL') as Object };
    else if (json && json.hasOwnProperty('restoretoOriginallocation'))
      json.restoretoOriginallocation = { ...json.restoretoOriginallocation, ...this.config.get('CREDENTIAL') as Object };

    let result = null;

    switch (action) {
      case 'exportmailbox':
        return this.veeam.exportMailbox(rid, mid, json, veeam_access_token, res);
      case 'restoremailbox':
        result = await this.veeam.restoreMailbox(rid, mid, json, veeam_access_token);
        break;
      case 'restoremailitem':
        result = await this.veeam.restoreMailItem(rid, mid, iid, json, veeam_access_token);
        break;
      case 'restoremultiplemailitems':
        result = await this.veeam.restoreMultipleMailItems(rid, mid, json, veeam_access_token);
        break;
      case 'exportmailitem':
        return this.veeam.exportMailItem(rid, mid, iid, json, veeam_access_token, res);
      case 'exportonedrive':
        return this.veeam.exportOneDrive(rid, uid, json, veeam_access_token, res);
      case 'exportonedriveitem':
        return this.veeam.exportOneDriveItem(rid, uid, type, iid, json, veeam_access_token, res);
      case 'restoreonedrive':
        result = await this.veeam.restoreOneDrive(rid, uid, json, veeam_access_token);
        break;
      case 'restoreonedriveitem':
        result = await this.veeam.restoreOneDriveItem(rid, uid, type, iid, json, veeam_access_token);
        break;
      case 'restoremultipleonedriveitems':
        result = await this.veeam.restoreMultipleOneDriveItems(rid, uid, type, json, veeam_access_token);
        break;
      case 'exportmultipleonedriveitems':
        return this.veeam.exportMultipleOneDriveItems(rid, uid, type, json, veeam_access_token, res);
      case 'exportsharepointitem':
        return this.veeam.exportSharePointItem(rid, sid, type, iid, json, veeam_access_token, res);
      case 'exportmultiplesharepointitems':
        return this.veeam.exportMultipleSharePointItems(rid, sid, type, json, veeam_access_token, res);
      case 'restoresharepoint':
        this.veeam.restoreSharePoint(rid, sid, json, veeam_access_token);
        result = { message: 'Site restore started. You will be notified about the status in a few minutes.' };
        break;
      case 'restoresharepointitem':
        result = await this.veeam.restoreSharePointItem(rid, sid, type, iid, json, veeam_access_token);
        break;
      case 'restoremultiplesharepointitems':
        result = await this.veeam.restoreMultipleSharePointItems(rid, sid, type, json, veeam_access_token);
        break;
      default:
        throw new InternalServerErrorException('Action is invalid.');
    }

    if (result)
      return res.json(result);
  }

  @Post('getVeeamAccessToken')
  @UseGuards(AuthGuard())
  veeamAccessToken(@Req() req: Request, @Body() body) {
    const { action, rid, mid } = body;
    return {
      token: req['user'].veeam_access_token,
      url: `${this.config.veeamUrl}/RestoreSessions/${rid}/Organization/Mailboxes/${mid}/Action`
    };
  }
}
