import { Controller, Post, Body, Res, UseGuards, Req, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { UserService } from '../../typeorm';

@Controller('users')
export class UsersController {
  constructor(
    private userService: UserService,
  ) {}

  @Get()
  @UseGuards(AuthGuard())
  async getUsers(@Req() req: Request) {
    const users = await this.userService.findAll();
    return { users };
  }
}
