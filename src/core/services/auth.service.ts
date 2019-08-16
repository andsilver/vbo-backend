import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../typeorm';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    user: any,
    veeam_access_token: string,
    veeam_refresh_token: string
  ) {
    return {
      token: this.jwtService.sign({
        ...user,
        veeam_access_token,
        veeam_refresh_token
      }),
      user
    };
  }
}
