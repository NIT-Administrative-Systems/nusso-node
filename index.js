const axios = require('axios');
const constants = require('./constants');

/** @module NorthwesternSSO */
module.exports = {
  /**
   * Parses json object of all cookies and returns the sso cookie value
   * @param {Object} requestCookies - A JSON object of all request cookies to check
   * @returns {String} The SSO request cookie value
   */
  getSSOCookie(requestCookies) {
    return requestCookies[constants.SSO_COOKIE_NAME];
  },

  async getSessionInfo(tokenId) {
    const WEBSSO_IDENTITY_CONFIRMATION_URL = `https://${constants.DOMAIN}/nusso/json/realms/root/realms/${constants.REALM}/sessions?_action=getSessionInfo`;
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
      return {
        status: sessionInfoResponse.status,
        data: sessionInfoResponse.data,
      };
    } catch (err) {
      return {
        status: err.response.status,
        data: err.response.data,
      };
    }
  },

  isLoggedIn(sessionInfo) {
    switch (sessionInfo.status) {
      case 200:
        if (sessionInfo.data[constants.NETID_PROPERTY_NAME]) {
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
        if (sessionInfo.data[constants.NETID_PROPERTY_NAME]) {
          if (sessionInfo.data[constants.DUO_PROPERTY_NAME] === true) {
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
    const WEBSSO_LOGIN_URL = `https://${constants.DOMAIN}/nusso/XUI/?realm=${constants.REALM}#login&authIndexType=service&authIndexValue=${isDuoRequired ? constants.LDAP_AND_DUO_TREE : constants.LDAP_TREE}&goto=${redirectUrl}`;
    return WEBSSO_LOGIN_URL;
  },

  getNetID(sessionInfo) {
    return sessionInfo.data[constants.NETID_PROPERTY_NAME];
  },

};
