import * as dotenv from 'dotenv';

export class ConfigService {

  config: {
    [key: string]: string
  };

  constructor() {
    this.config = dotenv.config({
      path: 'src/config/.env'
    }).parsed;
    console.log(process.env.NODE_ENV);
  }

  get(key: string) {
    return this.config[key];
  }

  get veeamUrl() {
    return `https://${this.config.VEEAM_HOST}:${this.config.VEEAM_PORT}/${this.config.VEEAM_VERSION}`;
  }

  get isDevelopment() {
    return this.config['NODE_ENV'] === 'development';
  }
}
