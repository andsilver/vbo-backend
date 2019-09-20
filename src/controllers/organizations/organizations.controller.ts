import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from '../../typeorm';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VeeamApi } from '../../core/external/veeam-api';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationService: OrganizationService,
    private veeamApi: VeeamApi
  ) { }

  @Get('users')
  @UseGuards(AuthGuard())
  async getOrganizationUsers(@Req() req: Request) {
    const { veeam_access_token, organization } = req['user'];
    const allUsers = await this.veeamApi.getOrganizationUsers(organization.office365_id, veeam_access_token);
    const portalUsers = await this.organizationService.getOrganizationUsers(organization.id);
    return {
      users: allUsers,
      active: portalUsers
    }
  }

  @Get('licensing')
  @UseGuards(AuthGuard())
  async getLicensing(@Req() req: Request) {
    const { veeam_access_token, organization } = req['user'];
    if (organization) {
      const org = await this.veeamApi.getOrganizationByID(organization.office365_id, veeam_access_token);
      const licensing = await this.veeamApi.getLicenseInfo(organization.office365_id, veeam_access_token);
      org.licensing = licensing;
      return org;
    }
    const organizations = await this.veeamApi.getOrganizations(veeam_access_token);
    for (const org of organizations) {
      org.licensing = await this.veeamApi.getLicenseInfo(org.id, veeam_access_token);
    }
    return organizations;
  }

  @Get('licensing/:id')
  @UseGuards(AuthGuard())
  async licensingForOrganization(@Req() req: Request, @Param('id') office365Id: string) {
    const { veeam_access_token } = req['user'];
    const users: any[] = (await this.veeamApi.getLicensedUsers(office365Id, veeam_access_token)).results;
    const repos: any[] = (await this.veeamApi.getOrganizationRepositories(office365Id, veeam_access_token));
    const repoUsers = [];
    for (const r of repos) {
      const repoid = r._links.backupRepository.href.split('/').pop();
      for (const u of users) {
        const combinedid = u.backedUpOrganizationId + u.id;
        const udata = await this.veeamApi.getUserData(repoid, combinedid, veeam_access_token);
        repoUsers.push({
          ...u,
          id: udata.id,
          email: udata.email,
          name: udata.displayName,
          isMailboxBackedUp: udata.isMailboxBackedUp,
          isOneDriveBackedUp: udata.isOneDriveBackedUp,
          isArchiveBackedUp: udata.isArchiveBackedUp,
          isPersonalSiteBackedUp: udata.isPersonalSiteBackedUp
        });
      }
    }
    return repoUsers;
  }
}
