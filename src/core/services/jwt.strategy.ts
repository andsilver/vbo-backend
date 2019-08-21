import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { jwt } from './constants';
import { UserService } from '../../typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwt.secret
    });
  }

  async validate(payload: any) {
    const { email } = payload;
    const user = await this.userService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException('User not exist.');
    return payload;
  }
}
