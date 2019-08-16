import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from './services/config.service';
import { VeeamApi } from './external/veeam-api';
import { AuthService } from './services/auth.service';
import { LocalStrategy } from './services/local.strategy';
import { JwtStrategy } from './services/jwt.strategy';
import { jwt } from './services/constants';
import { UserModule } from '../typeorm';
import { Sendgrid } from './external/sendgrid';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
      secret: jwt.secret,
      signOptions: {
        expiresIn: '2d'
      }
    }),
    UserModule
  ],
  providers: [
    {
      provide: ConfigService,
      useValue: new ConfigService()
    },
    VeeamApi,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    Sendgrid
  ],
  exports: [ConfigService, VeeamApi, AuthService, Sendgrid, JwtModule, PassportModule]
})
export class CoreModule {}
