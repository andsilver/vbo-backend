import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as qs from 'qs';
import * as os from 'os';
import * as fs from 'fs';
import * as https from 'https';
import { Response } from 'express';
import { PusherService } from './pusher';
import { ConfigService } from '../services/config.service';

@Injectable()
export class VeeamApi {
  private axios: AxiosInstance;

  constructor(private config: ConfigService, private pusher: PusherService) {
    this.axios = Axios.create({
      baseURL: config.veeamUrl,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    this.axios.interceptors.response.use(res => {
      return res;
    }, err => {
      console.error(err.response || err);
      try {
        const message = err.response.data.toString();
        err.response.data = JSON.parse(message);
      } catch (_err) { }
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
        Accept: 'application/json',
      }
    });
    return result.data;
  }

  /**
   * @param id Organization ID
   * @return result
   */
  async getOrganizationByID(orgId: string, token: string) {
    const result: AxiosResponse = await this.axios.get(`/Organizations/${orgId}`, {
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
    const url = '/BackupRepositories/' + id + '/UserData/' + uid || '';
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
    const url = id !== 'tenant' ? `/Organizations/${id}/Action` : '/Organization/Action';
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
  async stopRestoreSession(rid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Action';
    const json = { stop: null };
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
  async getMailboxItems(rid: string, mid: string, fid: string, name: string, offset: number, token: string) {
    let url = '/RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items';
    let query = '?';
    if (fid)
      query += `folderId=${fid}`;
    if (name)
      query += `&name=${name}`;
    if (offset)
      query += `&offset=${offset}&limit=30`;
    const result: AxiosResponse = await this.axios.get(url + query, {
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
  async exportMailbox(rid: string, mid: string, json: any, token: string, res: Response) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        'Accept': 'application/octet-stream',
        'Authorization': 'Bearer ' + token
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + mid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid Item ID
   * @param json JSON format
   * @return file
   */
  async exportMailItem(rid, mid, iid, json, token, res: Response) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items/' + iid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        'Accept': 'application/octet-stream',
        'Authorization': 'Bearer ' + token,
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + iid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid File name for export
   * @param json JSON format
   * @return file
   */
  async exportMultipleMailItems(rid, mid, iid, json, token, res: Response) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items/Action';
  }
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
  async restoreMailbox(rid: string, mid: string, json: any, token: string) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
      }
    });
    let message;
    if (result.data.createdItemsCount >= 1) {
      message = 'Mailbox has been restored.';
    } else if (result.data.mergedItemsCount === 1) {
      message = 'Item has been restored and has been merged.';
    } else if (result.data.failedItemsCount === 1) {
      message = 'Item restore failed.';
    } else if (result.data.skippedItemsCount === 1) {
      message = 'Item has been skipped.';
    } else {
      message = 'Restore failed.';
    }

    return { message };
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param iid Item ID
   * @param json JSON
   * @return STRING
   */
  async restoreMailItem(rid: string, mid: string, iid: string, json: any, token: string) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items/' + iid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
      }
    });
    let message;
    if (result.data.createdItemsCount >= 1) {
      message = 'Item has been restored.';
    } else if (result.data.mergedItemsCount === 1) {
      message = 'Item has been restored and has been merged.';
    } else if (result.data.failedItemsCount === 1) {
      message = 'Item restore failed.';
    } else if (result.data.skippedItemsCount === 1) {
      message = 'Item has been skipped.';
    } else {
      message = 'Restore failed.';
    }
    return { message };
  }

  /**
   * @param rid Restore Session ID
   * @param mid Mailbox ID
   * @param json JSON
   * @return STRING
   */
  async restoreMultipleMailItems(rid: string, mid: string, json: any, token: string) {
    const url = 'RestoreSessions/' + rid + '/Organization/Mailboxes/' + mid + '/Items/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token,
      }
    });
    const { data } = result;
    const message = `
      ${data.createdItemsCount} items created, 
      ${data.mergedItemsCount} items merged, 
      ${data.failedItemsCount} items failed, 
      ${data.skippedItemsCount} items skipped`;
    return { message };
  }

  // /**
  //  * Start OneDrive for Business functions
  //  */

  /**
   * @param rid Restore Session ID
   * @return result
   */
  async getOneDrives(rid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Organization/OneDrives/?offset=0&limit=1000';
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
   * @param uid User ID
   * @return result
   */
  async getOneDriveID(rid: string, uid: string, token: string) {
    const url = '/RestoreSessions/' + rid + '/Organization/OneDrives/' + uid;
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
   * @param uid OneDrive User ID
   * @param pid Parent ID (null or item ID)
   * @param type Folders (default) or documents
   * @param parent Request parent folder - true or false
   * @return result
   */
  async getOneDriveParentFolder(rid: string, uid: string, pid: string, type: 'Folders' | 'Documents', token: string) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}/${pid}`;
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
   * @param uid OneDrive User ID
   * @param pid Parent ID (null or item ID)
   * @param type Folders (default) or documents
   * @param offset Offset
   * @return result
   */
  async getOneDriveTree(rid: string, uid: string, type: 'Folders' | 'Documents', pid: string = null, offset: number = null, token: string) {
    let url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}`;
    let query = '?';
    query += pid ? `parentID=${pid}` : 'parentID=null';
    query += offset ? `&offset=${offset}` : '';
    const result: AxiosResponse = await this.axios.get(url + query, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    return result.data;
  }

  /**
 * @param rid Restore Session ID
 * @param uid User ID
 * @param json JSON format
 * @return file
 */
  async exportOneDrive(rid: string, uid: string, json: any, token: string, res: Response) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + uid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param iid Item ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return file
   */
  async exportOneDriveItem(rid: string, uid: string, type: string, iid: string, json: any, token: string, res: Response) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}/${iid}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + iid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @param type Documents
   * @return file
   */
  async exportMultipleOneDriveItems(rid: string, uid: string, type: string, json: any, token: string, res: Response) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + uid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @return result
   */
  async restoreOneDrive(rid: string, uid: string, json: any, token: string) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return { message: result.data.restoredItemsCount >= 1 ? 'Item has been restored.' : 'Failed to restore the item.' };
  }

  /**
   * @param iid Item ID
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return result
   */
  async restoreOneDriveItem(rid, uid, type, iid, json, token) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}/${iid}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return { message: result.data.restoredItemsCount >= 1 ? 'Item has been restored.' : 'Failed to restore the item.' };
  }

  /**
   * @param rid Restore Session ID
   * @param uid User ID
   * @param json JSON format
   * @param type Documents
   * @return result
   */
  async restoreMultipleOneDriveItems(rid, uid, type, json, token) {
    const url = `/RestoreSessions/${rid}/Organization/OneDrives/${uid}/${type}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const { data } = result;
    // const message = `
    //   ${data.restoredItemsCount} items restored successfully,
    //   ${data.failedItemsCount} items were failed, 
    //   ${data.skippedItemsByErrorCount} items were skipped by error,
    //   ${data.skippedItemsByNoChangesCount} items skipped by no changes`,
    //   ;
    // return { message };
    // console.log(result.data)
    // return data;
    return { message: data.restoredItemsCount >= 1 ? 'Items have been restored.' : 'Failed to restore the items.' };
  }

  /**
   * Start SharePoint functions
   */

  /**
   * @param rid Restore Session ID
   * @return result
   */
  async getSharePointSites(rid, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites?offset=0&limit=1000';
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
   * @param sid SharePoint Site ID
   * @param iid Item ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return file
   */
  async exportSharePointItem(rid: string, sid: string, type: string, iid: string, json: any, token: string, res: Response) {
    const url = `/RestoreSessions/${rid}/Organization/Sites/${sid}/${type}/${iid}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + iid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  async exportMultipleSharePointItems(rid, sid, type, json, token, res: Response) {
    const url = `/RestoreSessions/${rid}/Organization/Sites/${sid}/${type}/Action`;
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream'
      },
      responseType: 'arraybuffer'
    });
    const temp = os.tmpdir() + '/' + sid;
    fs.writeFileSync(temp, result.data);
    return res.download(temp);
  }

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @return result
   */
  async getSharePointLists(rid, sid, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/Lists?offset=0&limit=1000';
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
   * @param sid SharePoint Site ID
   * @return result
   */
  async getSharePointContent(rid, sid, type, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/' + type;
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
   * @param sid SharePoint Site ID
   * @param cid Content ID
   * @param type Folders (default), items or documents
   * @return result
   */
  async getSharePointListName(rid, sid, type, cid, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/' + type + '/' + cid;
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
   * @param sid SharePoint Site ID
   * @return result
   */
  async getSharePointSiteName(rid, sid, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid;
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
   * @param sid SharePoint Site ID
   * @param pid Parent Content ID
   * @param type Folders (default), items or documents
   * @param offset Offset
   * @return result
   */
  async getSharePointTree(rid, sid, type, pid, offset, token) {
    let url = `/RestoreSessions/${rid}/Organization/Sites/${sid}/${type}?parentId=${pid}`;
    url += offset ? `&offset=${offset}` : '';
    const result: AxiosResponse = await this.axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return result.data;
  }

  // async getSharePointParentFolder(rid, sid, type, pid, token) {
  //   let url = 
  // }

  /**
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param json JSON format
   * @return result
   */
  async restoreSharePoint(rid, sid, json, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    let message, data = result.data;
    try {
      if (data.restoreIssues.length >= 1) {
        message = 'SharePoint site has been restored with warnings.';
      } else if (data.failedWebsCount >= 1) {
        message = 'Failed to restore the SharePoint site.';
      } else if (data.failedRestrictionsCount >= 1) {
        message = 'Failed to restore the SharePoint site due to restrictions errors.';
      } else {
        message = 'SharePoint site has been restored.';
      }
      this.pusher.sharePointRestoreFinished({ message, error: false });
    } catch (_err) {
      message = data.toString();
      this.pusher.sharePointRestoreFinished({ message, error: true });
    }
  }

  /**
   * @param iid Item ID
   * @param rid Restore Session ID
   * @param sid SharePoint Site ID
   * @param json JSON format
   * @param type Folders (default) or documents
   * @return result
   */
  async restoreSharePointItem(rid, sid, type, iid, json, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/' + type + '/' + iid + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    let message, data = result.data;
    if (data.restoreIssues.length >= 1) {
      message = 'SharePoint site items has been restored with warnings.';
    } else if (data.failedWebsCount >= 1) {
      message = 'Failed to restore the SharePoint site.';
    } else if (data.failedRestrictionsCount >= 1) {
      message = 'Failed to restore the SharePoint site due to restrictions errors.';
    } else {
      message = 'SharePoint site has been restored.';
    }
    return { message };
  }

  /**
   * @param rid Restore Session ID
   * @param sid Site ID
   * @param json JSON format
   * @param type Documents
   * @return result
   */
  async restoreMultipleSharePointItems(rid, sid, type, json, token) {
    const url = '/RestoreSessions/' + rid + '/Organization/Sites/' + sid + '/' + type + '/Action';
    const result: AxiosResponse = await this.axios.post(url, json, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    let message, data = result.data;
    if (data.restoredItemsCount >= 1) {
      message = 'Items have been restored.';
    } else {
      message = 'Failed to restore the items.';
    }
    return { message };
  }
}
