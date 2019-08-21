import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import fileDownload from 'js-file-download';
import * as qs from 'qs';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as dateFormat from 'dateformat';
import { ConfigService } from '../services/config.service';

const get_mime_type = (filename: string) => {

  const idx = filename.split('.').pop();
  const mimetypes = { 
    'txt': 'text/plain',
    'htm': 'text/html',
    'html': 'text/html',
    'php': 'text/html',
    'css': 'text/css',
    'js' : 'application/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'swf': 'application/x-shockwave-flash',
    'flv': 'video/x-flv',

    /* Images */
    'png': 'image/png',
    'jpe': 'image/jpeg',
    'jpeg':  'image/jpeg',
    'jpg': 'image/jpeg',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'ico': 'image/vnd.microsoft.icon',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'svg': 'image/svg+xml',
    'svgz': 'image/svg+xml',

    /* Archives */
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    'exe': 'application/x-msdownload',
    'msi': 'application/x-msdownload',
    'cab': 'application/vnd.ms-cab-compressed',

    /* Audio and video */
    'mp3': 'audio/mpeg',
    'qt': 'video/quicktime',
    'mov': 'video/quicktime',

    /* Adobe */
    'pdf': 'application/pdf',
    'psd': 'image/vnd.adobe.photoshop',
    'ai': 'application/postscript',
    'eps': 'application/postscript',
    'ps': 'application/postscript',

    /* Microsoft Office */
    'doc': 'application/msword',
    'rtf': 'application/rtf',
    'xls': 'application/vnd.ms-excel',
    'ppt': 'application/vnd.ms-powerpoint',
    'docx': 'application/msword',
    'xlsx': 'application/vnd.ms-excel',
    'pptx': 'application/vnd.ms-powerpoint',

    /* Open Office */
    'odt': 'application/vnd.oasis.opendocument.text',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
  };

  if (mimetypes[idx]) {
      return mimetypes[idx];
  } else {
      return 'application/octet-stream';
  }
}


const download = (res, ext, name) => {
  // const fileObj = file.replace("..", "");
  let filename = path.basename(name);
  if (ext !== "plain")
    filename = filename + '.' + ext;
  const stats = fs.statSync(res);

  res.header('Pragma', 'public');
  res.header('Expires', 0);
  res.header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0');

  if (ext === "msg" || ext === "pst") {
    res.header('Content-Encoding', 'UTF-8');
    res.header('Content-Type', 'application/vnd.ms-outlook;charset=UTF-8'); 
    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Transfer-Encoding', 'binary');
    res.header('Content-Length', stats.size);
    res.header('Content-Disposition', 'attachment; filename="' + filename + '"');
  } else {
    res.header('Last-Modified', dateFormat(new Date(stats.mtime), "D, dd mm yyyy H:MM:ss") + ' GMT');
    res.header('Cache-Control: private', false);
    if (ext === "plain") {
      const mime = get_mime_type(filename);
      res.header('Content-Type', mime);
    } else {
      res.header('Content-Type', 'application/zip');
    }
    res.header('Content-Transfer-Encoding', 'binary');
    res.header('Content-Length', stats.size);
    res.header('Content-Disposition', 'attachment; filename=" ' + filename + '"');
    res.header('Connection', 'close');
  }
  fileDownload(res, name);
}

@Injectable()
export class VeeamApi {
  private axios: AxiosInstance;

  constructor(private config: ConfigService) {
    this.axios = Axios.create({
      baseURL: config.veeamUrl
    });
    this.axios.interceptors.response.use(res => {
      return res;
    }, err => {
      console.error(err.response);
      if (err.response.status === 401) throw new UnauthorizedException('Request is not authorized.');
      else throw new InternalServerErrorException(err.response.data.message);
    });
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }

  async login() {
    const res = await this.axios.post(
      '/Token',
      qs.stringify({
        username: this.config.get('VEEAM_USERNAME'),
        password: this.config.get('VEEAM_PASSWORD'),
        grant_type: 'password'
      })
    );
    return res.data;
  }

  /**
   * @param refreshtoken Refresh Token
   * @return SESSION
   */
  async refreshToken(refreshtoken: string) {
    const url = '/Token';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshtoken
    }));
    return result.data;
  }

  /**
   * @param organization Organization
   * @return result
   */
  async addOrganization(organization: any, token: string) {
    const result: AxiosResponse = await this.axios.post(
      '/Organizations',
      qs.stringify(organization),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      }
    );
    return result.data;
  }

  async getOrganizationUsers(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get(`/Organizations/${orgId}/Users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
 * @param orgId Organization ID
 * @return result
 */
  async getJobs(orgId: string = null, token: string) {
    const url = orgId ? `/Organizations/${orgId}/Jobs` : 'Jobs';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  };


  /**
   * @return result
   */
  async getBackupRepositories(token: string) {
    const result: AxiosResponse = await this.axios.get('/BackupRepositories', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param jobId Job ID
   * @return result
   */
  async getJobSelectedItems(jobId: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Jobs/' + jobId + '/SelectedItems', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Job ID
   * @return result
   */
  async getJobSessions(jobId: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Jobs/' + jobId + '/JobSessions', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param orgId Organization ID
   * @return result
   */
  async getLicenseInfo(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Organizations/' + orgId + '/LicensingInformation', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Organization ID
   * @return result
   */
  async getLicensedUsers(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get(`/LicensedUsers?organizationId=${orgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getOrganization(token: string) {
    const result: AxiosResponse = await this.axios.get('/Organization', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Organization ID
   * @return result
   */
  async getOrganizationByID(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get(`/Organization/${orgId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore session ID
   * @return result
   */
  async getRestoreSessionForOrganization(rid: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/RestoreSessions/' + rid + '/Organization', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param orgId Organization ID
   * @return result
   */
  async getOrganizationJobs(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Organizations/' + orgId + '/Jobs', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore session ID
   * @return result
   */
  async getOrganizationRepositories(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Organizations/' + orgId + '/usedRepositories', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getOrganizations(token: string) {
    const result: AxiosResponse = await this.axios.get('/Organizations', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getProxies(token: string) {
    const result: AxiosResponse = await this.axios.get('/Proxies', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Repository ID
   * @return result
   */
  async getProxy(id: string, token: string) {
    const result: AxiosResponse = await this.axios.get('/Proxies/' + id, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Backup Repository ID
   * @return result
   */
  async getSiteData(id: string, token: string) {
    const url = '/BackupRepositories/' + id + '/SiteData';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Backup Repository ID
   * @return result
   */
  async getUserData(id: string, uid: string, token: string) {
    const url = '/BackupRepositories/' + id + '/UserData/' + uid || '' ;
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param id Job ID
   * @param json JSON format
   * @return result
   */
  async changeJobState(id: string, json: any, token: string) {
    const url = '/Jobs/' + id + '/Action';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify(json), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return result.data;
  }

  /**
   * @param id Job ID
   * @return string
   */
  async startJob(id: string, token: string) {
    const url = '/Jobs/' + id + '/Action';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify({ start: null }), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return result.data;
  }

  /**
   * @param id Job ID
   * @return string
   */
  async stopJob(id: string, token: string) {
    const url = '/Jobs/' + id + '/Action';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify({ stop: null }), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return result.data;
  }


  /**
   * @param json JSON code for Exchange, OneDrive or SharePoint
   * @id Organization ID
   * @return result
   */
  async startRestoreSession(id: string, json: any, token: string) {
    const url = id ? `/Organizations/${id}/Action` : '/Organization/Action';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify(json), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return result.data;
  }

  /**
   * @param rid RestoreSessoin ID
   * @param json JSON
   * @return string
   */
  async stopRestoreSession(rid: string, json: any, token: string) {
    const url = '/RestoreSessions/' + rid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, qs.stringify(json), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return result.data;
  }

  /**
   * Start Session Log functions
   */

  /**
   * @param rid RestoreSessoin ID
   * @return result
   */
  async getRestoreSessionEvents(rid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Events';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getSessions(token: string) {
    const url = '/RestoreSessions';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getBackupJobSessions(token: string) {
    const url = '/JobSessions';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param sid Session ID
   * @return result
   */
  async getBackupSessionLog(sid: string, token: string) {
    const url = '/JobSessions/' + sid + '/LogItems?limit=1000';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @return result
   */
  async getRestoreSessions(token: string) {
    const url = '/RestoreSessions';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * Start Exchange functions
   */

  /**
   * @param rid Restore Session ID
   * @return result
   */
  async getMailboxes(rid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Organization/Mailboxes/?offset=0&limit=1000';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore Session ID
   * @param mid MailBox ID
   * @return result
   */
  async getMailbox(rid: string, mid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid;
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @return result
   */
  async getMailboxFolders(rid: string, mid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/folders?limit=1000';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param offset Offset to start from
   * @return result
   */
  async getMailboxItems(rid: string, mid: string, fid: string, offset: number, token: string) {
    let url = '/RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items';
    if (fid)
      url += `?folderId=${fid}`;
    if (offset)
      url += `&offset=${offset}&limit=30`;
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param json JSON format
   * @return file
   */
  async exportMailbox(rid: string, mid: string, json: any, token: string) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Action';
    const tmpFile = os.tmpdir() + '/' + mid;
    const resource = fs.openSync(tmpFile, 'w');

    const config = {
      headers: {
        'Accept': 'application/octet-stream',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      http_errors: false,
      verify: false,
      body: json,
      sink: resource
    }
    const result: AxiosResponse = await this.axios.post(url, config);
    fs.closeSync(resource);
    // download(result, result.body.ext, result.body.filename);
    return result.data;
  }
  // router.post('/exportMailbox', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + mid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     http_errors: false,
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Action', config);
  //     fs.closeSync(resource);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(resource);
  //       response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid Item ID
   * @param json JSON format
   * @return file
   */
  // router.post('/exportMailItem', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + iid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     http_errors: false,
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Items/' + req.body.iid + '/Action', config);
  //     fs.closeSync(resource);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(resource);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid File name for export
   * @param json JSON format
   * @return file
   */
  // router.post('/exportMultipleMailItems', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + iid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     http_errors: false,
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Items/Action', config);
  //     fs.closeSync(resource);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(resource);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param json JSON
   * @return STRING
   */
  // router.post('/restoreMailbox', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.createdItemsCount >= 1) {
  //       response.send('Mailbox has been restored.');
  //     } else if (res.data.mergedItemsCount === 1) {
  //       response.send('Item has been restored and has been merged.');
  //     } else if (res.data.failedItemsCount === 1) {
  //       response.send('Item restore failed.');
  //     } else if (res.data.skippedItemsCount === 1) {
  //       response.send('Item has been skipped.');
  //     } else {
  //       response.send('Restore failed.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid Item ID
   * @param json JSON
   * @return STRING
   */
  // router.post('/restoreMailItem', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Items/' + req.body.iid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.createdItemsCount >= 1) {
  //       response.send('Mailbox has been restored.');
  //     } else if (res.data.mergedItemsCount === 1) {
  //       response.send('Item has been restored and has been merged.');
  //     } else if (res.data.failedItemsCount === 1) {
  //       response.send('Item restore failed.');
  //     } else if (res.data.skippedItemsCount === 1) {
  //       response.send('Item has been skipped.');
  //     } else {
  //       response.send('Restore failed.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param json JSON
   * @return STRING
   */
  // router.post('/restoreMultipleMailItems', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Mailboxes/' + req.body.mid + '/Items/Action', qs.stringify(req.body.json), config);
  //     if (res.data.createdItemsCount >= 1) {
  //       response.send('Mailbox has been restored.');
  //     } else if (res.data.mergedItemsCount === 1) {
  //       response.send('Item has been restored and has been merged.');
  //     } else if (res.data.failedItemsCount === 1) {
  //       response.send('Item restore failed.');
  //     } else if (res.data.skippedItemsCount === 1) {
  //       response.send('Item has been skipped.');
  //     } else {
  //       response.send('Restore failed.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });

  // /**
  //  * Start OneDrive for Business functions
  //  */

  /**
   * @param rid Restore Session ID
   * @return result
   */
  // router.post('/getOneDrives', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/?offset=0&limit=1000', config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else if (err.response.status === 500) {
  //       response.send('500');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @return result
   */
  // router.post('/getOneDriveID', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid OneDrive User ID
   * @param pid Parent ID (null or item ID)
   * @param type Folders (default) or documents
   * @param parent Request parent folder - true or false
   * @return result
   */
  // router.post('/getOneDriveParentFolder', async (req, response) => {

  //   let call = veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type + '/' + req.body.pid;

  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(call, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid OneDrive User ID
   * @param pid Parent ID (null or item ID)
   * @param type Folders (default) or documents
   * @param offset Offset
   * @return result
   */
  // router.post('/getOneDriveTree', async (req, response) => {

  //   let call = veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type;

  //   if (req.body.pid) {
  //     call += '?parentID=' + req.body.pid;

  //     if (req.body.offset) {
  //       call += '&offset=' + req.body.offset;
  //     }
  //   } else {
  //     call += '?parentID=null';

  //     if (req.body.offset) {
  //         call += '&offset=' + req.body.offset;
  //     }
  //   }

  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(call, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
 * @param rid Restore Session ID
 * @param uid User ID
 * @param json JSON format
 * @return file
 */
  // router.post('/exportOneDrive', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + req.body.uid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/Action', config);
  //     fs.closeSync(tmpFile);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(tmpFile);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param iid Item ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return file
   */
  // router.post('/exportOneDriveItem', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + req.body.iid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     verify: false,
  //     body: json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type + '/' + req.body.iid + '/Action', config);
  //     fs.closeSync(tmpFile);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(tmpFile);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param iid Item ID
   * @param json JSON format
   * @param type Documents
   * @return file
   */
  // router.post('/exportMultipleOneDriveItems', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + req.body.iid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     http_errors: false,
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type + '/Action', config);
  //     fs.closeSync(tmpFile);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(tmpFile);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @return result
   */
  // router.post('/restoreOneDrive', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoredItemsCount >= 1) {
  //       response.send('Item has been restored.');
  //     } else {
  //       response.send('Failed to restore the item.');
  //     }
  //   } catch (err) {
  //       response.send(null);
  //   }
  // });

  /**
   * @param iid Item ID
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return result
   */
  // router.post('/restoreOneDriveItem', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type + '/' + req.body.iid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoredItemsCount >= 1) {
  //       response.send('Item has been restored.');
  //     } else {
  //       response.send('Failed to restore the item.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @param type Documents
   * @return result
   */
  // router.post('/restoreMultipleOneDriveItems', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/OneDrives/' + req.body.uid + '/' + req.body.type + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoredItemsCount >= 1) {
  //       response.send('Item has been restored.');
  //     } else {
  //       response.send('Failed to restore the item.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });

  /**
   * Start SharePoint functions
   */

  /**
   * @param rid Restore Session ID
   * @return result
   */
  // router.post('/getSharePointSites', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites?offset=0&limit=1000', config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else if (err.response.status === 500) {
  //       response.send('500');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param iid Item ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return file
   */
  // router.post('/exportSharePointItem', async (req, response) => {
  //   let tmpFile = os.tmpdir() + '/' + req.body.iid;
  //   let resource = fs.openSync(tmpFile, 'w');

  //   const config = {
  //     headers: {
  //       'Accept': 'application/octet-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     },
  //     verify: false,
  //     body: req.body.json,
  //     sink: resource
  //   }

  //   try {
  //     const res = await axios.post('RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type + '/' + req.body.iid + '/Action', config);
  //     fs.closeSync(tmpFile);
  //     download(res, req.body.ext, req.body.filename);
  //     response.send(res.data)
  //   } catch (err) {
  //     fs.closeSync(tmpFile);
  //     response.send(null);
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @return result
   */
  // router.post('/getSharePointLists', async (req, response) => {

  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/Lists?offset=0&limit=1000', config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @return result
   */
  // router.post('/getSharePointContent', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else if (err.response.status === 500) {
  //       response.send('500');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param cid Content ID
   * @param type Folders (default), items or documents
   * @return result
   */
  // router.post('/getSharePointListName', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type + '/' + req.body.cid, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @return result
   */
  // router.post('/getSharePointSiteName', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param pid Parent Content ID
   * @param type Folders (default), items or documents
   * @param offset Offset
   * @return result
   */
  // router.post('/getSharePointTree', async (req, response) => {

  //   let call = veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type + '?parentId=' + req.body.pid;

  //   if (req.body.offset ) {
  //       call += '&offset=' + req.body.offset;
  //   }
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.get(call, config);
  //     response.send(res.data)
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  // router.post('/getSharePointParentFolder', async (rid, siteid, type, folderid) => {

  // });

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param json JSON format
   * @return result
   */
  // router.post('/restoreSharePoint', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoreIssues.length >= 1) {
  //       response.send('SharePoint site has been restored with warnings.');
  //     } else if (res.data.failedWebsCount >= 1) {
  //       response.send('Failed to restore the SharePoint site.');
  //     } else if (res.data.failedRestrictionsCount >= 1) {
  //       response.send('Failed to restore the SharePoint site due to restrictions errors.');
  //     } else {
  //       response.send('SharePoint site has been restored.');
  //     }
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param iid Item ID
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return result
   */
  // router.post('/restoreSharePointItem', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type + '/' + req.body.iid + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoreIssues.length >= 1) {
  //       response.send('SharePoint site has been restored with warnings.');
  //     } else if (res.data.failedWebsCount >= 1) {
  //       response.send('Failed to restore the SharePoint site.');
  //     } else if (res.data.failedRestrictionsCount >= 1) {
  //       response.send('Failed to restore the SharePoint site due to restrictions errors.');
  //     } else {
  //       response.send('SharePoint site has been restored.');
  //     }
  //   } catch (err) {
  //     if (err.response.status === 401) {
  //       response.send('401');
  //     } else {
  //       response.send(null);
  //     }
  //   }
  // });

  /**
   * @param rid Restore Session ID
   * @param sid Site ID
   * @param json JSON format
   * @param type Documents
   * @return result
   */
  // router.post('/restoreMultipleSharePointItems', async (req, response) => {
  //   const config = {
  //     headers: {
  //       'Accept': 'application/json-stream',
  //       'Authorization' : 'Bearer ' + req.body.token,
  //       'Content-Type'  : 'application/x-www-form-urlencoded'
  //     }
  //   }

  //   try {
  //     const res = await axios.post(veeamServerURL + '/RestoreSessions/' + req.body.rid + '/Organization/Sites/' + req.body.sid + '/' + req.body.type + '/Action', qs.stringify(req.body.json), config);
  //     if (res.data.restoredItemsCount >= 1) {
  //       response.send('Items have been restored.');
  //     } else {
  //       response.send('Failed to restore the items.');
  //     }
  //   } catch (err) {
  //     response.send(null);
  //   }
  // });
}


