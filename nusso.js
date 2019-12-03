/* eslint-disable vars-on-top */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-console */
const axios = require('axios');

// NU websso config
const SSO_COOKIE_NAME = 'nusso';
const NETID_PROPERTY_NAME = 'username';
const DUO_PROPERTY_NAME = 'isDuoAuthenticated';

const DOMAIN = 'dev-websso.it.northwestern.edu';
const REALM = 'northwestern';
const LDAP_TREE = 'ldap-registry';
const LDAP_AND_DUO_TREE = 'ldap-and-duo';

// raw node.js calls to the NU WebSSO and Duo methods
module.exports = {
  getSSOCookie(requestCookies) {
    return requestCookies[SSO_COOKIE_NAME];
  },

  async getSessionInfo(tokenId) {
    const WEBSSO_IDENTITY_CONFIRMATION_URL = `https://${DOMAIN}/nusso/json/realms/root/realms/${REALM}/sessions?_action=getSessionInfo`;
    const requestBody = {
      tokenId,
      realm: '/',
    };
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Accept-API-Version': 'resource=3',
    };

    try {
      // create axios instace with the validateStatus configuration so that we can process diverse set of response codes
      // otherwise it treats anything not 200 as a rejected promise and executes the catch block
      const axiosInstance = axios.create({
        validateStatus(status) {
          return status >= 200 && status < 500;
        },
      });
      const sessionInfoResponse = await axiosInstance.post(WEBSSO_IDENTITY_CONFIRMATION_URL, requestBody, { headers: requestHeaders });
      console.log(`SSO Helper | got session info | Status: ${JSON.stringify(sessionInfoResponse.status)}`);
      return {
        status: sessionInfoResponse.status,
        data: sessionInfoResponse.data,
      };
    } catch (err) {
      console.log(`SSO Helper | get session info | An error occurred getting session info: ${JSON.stringify(err.response.data)}`);
      return {
        status: err.response.status,
        data: err.response.data,
      };
    }
  },

  isLoggedIn(sessionInfo) {
    switch (sessionInfo.status) {
      case 200:
        if (sessionInfo.data[NETID_PROPERTY_NAME]) {
          return true;
        }
        return false;
      case 401:
        return false;
      default:
        return false;
    }
  },

  isDuoAuthenticated(sessionInfo) {
    switch (sessionInfo.status) {
      case 200:
        if (sessionInfo.data[NETID_PROPERTY_NAME]) {
          if (sessionInfo.data[DUO_PROPERTY_NAME] === true) {
            return true;
          }
          return false;
        }
        return false;
      case 401:
        return false;
      default:
        return false;
    }
  },

  getLoginUrl(isDuoRequired, redirectUrl) {
    // direct to different tree depending on duo requirement
    const WEBSSO_LOGIN_URL = `https://${DOMAIN}/nusso/XUI/?realm=${REALM}#login&authIndexType=service&authIndexValue=${isDuoRequired ? LDAP_AND_DUO_TREE : LDAP_TREE}&goto=${redirectUrl}`;
    return WEBSSO_LOGIN_URL;
  },

  getNetID(sessionInfo) {
    return sessionInfo.data[NETID_PROPERTY_NAME];
  },

};
