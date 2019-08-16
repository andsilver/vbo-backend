import { environment as DEV_ENV } from '../../config/env.development';
import { environment as DEV_PROD } from '../../config/env.production';

export class ConfigService {

  config: {
    [key: string]: string
  };

  constructor() {
    this.config = (this.isDevelopment ? DEV_ENV : DEV_PROD) as any;
  }

  static get databaseConfig() {
    const env = process.env.NODE_ENV === 'development' ? DEV_ENV : DEV_PROD;
    return env.DATABASE as any;
  }

  get(key: string) {
    return this.config[key];
  }

  get veeamUrl() {
    return `https://${this.config.VEEAM_HOST}:${this.config.VEEAM_PORT}/${this.config.VEEAM_VERSION}`;
  }

  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  }
}
