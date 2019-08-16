import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { OrganizationService } from '../../typeorm';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { VeeamApi } from '../../core/external/veeam-api';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationService: OrganizationService, private veeamApi: VeeamApi) {}

  @Get('users')
  @UseGuards(AuthGuard())
  async getOrganizationUsers(@Req() req: Request) {
    const { veeam_access_token, organization } = req['user'];
    const allUsers = await this.veeamApi.getOrganizationUsers(organization.org_id, veeam_access_token);
    const portalUsers = await this.organizationService.getOrganizationUsers(organization.id);
    return {
      users: allUsers,
      active: portalUsers
    }
  }
}
