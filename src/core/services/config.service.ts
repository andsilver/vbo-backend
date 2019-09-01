import { environment as DEV_ENV } from '../../config/env.development';
import { environment as DEV_PROD } from '../../config/env.production';

const isDevelopment = process.env.NODE_ENV === 'development';

export class ConfigService {

  config: {
    [key: string]: string
  };

  constructor() {
    this.config = (isDevelopment ? DEV_ENV : DEV_PROD) as any;
  }

  static get databaseConfig() {
    const env = isDevelopment ? DEV_ENV : DEV_PROD;
    return env.DATABASE as any;
  }

  get(key: string) {
    return this.config[key];
  }

  get veeamUrl() {
    return `https://${this.config.VEEAM_HOST}:${this.config.VEEAM_PORT}/${this.config.VEEAM_VERSION}`;
  }
}
