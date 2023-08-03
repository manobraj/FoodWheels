import * as _ from 'lodash';
import * as crypto from 'crypto';

export function create(settings) {
  let parsedSettings = _.clone(defaultSettings);

  for (let k in parsedSettings) {
    if (settings[k] !== undefined) {
      parsedSettings[k] = settings[k];
    }
  }

  if (['sha1', 'sha256', 'sha128'].indexOf(parsedSettings.algorithm) === -1) {
    throw new Error('\'algorithm\' option has been set to an unknown algorithm "' + parsedSettings.algorithm + '"');
  }

  if (isNaN(parsedSettings.saltBits)) {
    throw new Error('\'saltBytes\' option isn\'t a number');
  }

  return new PasswortInstance(parsedSettings);
}

const defaultSettings = {
  algorithm: 'sha1',
  useSalt: true,
  saltBits: 8
}

export class PasswortInstance {

  private settings;

  constructor(settings) {
    this.settings = settings;
  }

  async hash(text) {
    return new Promise((fulfill, reject) => {
      let hash = crypto.createHash(this.settings.algorithm);
      hash.update(text);
      let salt = crypto.randomBytes(this.settings.saltBits);
      hash.update(salt);
      let hashed = hash.digest();

      fulfill(`${this.settings.algorithm}$${hashed.toString('hex')}$${salt.toString('hex')}`);
    });
  }

  async verify(clear, hashed: string) {
    return new Promise((fulfill, reject) => {
      if (hashed.indexOf('$') === -1 || hashed.split('$').length !== 3) {
        reject('malformed hash');
        return;
      }     
      
      let hashData = hashed.split('$');
      let algorithm = hashData[0];
      let verificationHash = hashData[1];
      let salt = hashData[2];

      let hash = crypto.createHash(algorithm);
      hash.update(clear);
      hash.update(new Buffer(salt, 'hex'));

      if(hash.digest().toString('hex') == verificationHash) {
        fulfill(1);
      }else{
        fulfill(0);
      }

    });
  }

}