const axios = require('axios');
const constants = require('./constants');

/** @module NorthwesternSSO */

/**
 * @typedef {Object} sessionInfoResponse
 * @property {String} status - The response code of the request
 * @property {Object} data - The response body of the request
 */

module.exports = {
  /**
   * Parses json object of all cookies and returns the sso cookie value
   * @param {Object} requestCookies - A JSON object of all request cookies to check
   * @returns {String} The SSO request cookie value
   */
  getSSOCookie(requestCookies) {
    return requestCookies[constants.SSO_COOKIE_NAME];
  },

  /**
   * Calls websso url to get information about the session for a given sso token
   * @async
   * @param {String} tokenId - The value in the sso cookie
   * @returns {sessionInfoResponse} Returns an object with the sessionInfo request status and request body
   */
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

  /**
   * Checks whether the user's session is valid
   * @param {sessionInfoResponse} sessionInfo - The response from the session info service (status, body)
   * @returns {Boolean} True if status is 200 and a netid value is found in the sessionInfo. False if status is 401 Unauthorized, or other.
   */
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

  /**
   * Checks whether the user passed through DUO
   * @param {sessionInfoResponse} sessionInfo - The response from the session info service (status, body)
   * @returns {Boolean} True if user has a valid session (200 + netid) and passed through DUO. False if session is invalid or did not pass through DUO.
   */
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

  /**
   * Get the url for redirect to websso login
   * @param {Boolean} isDuoRequired - Whether to generate a url for login-only or login+duo
   * @param {String} redirectUrl - the url to redirect to once login is successfully completed
   * @returns {String} A websso login url
   */
  getLoginUrl(isDuoRequired, redirectUrl) {
    // direct to different tree depending on duo requirement
    const WEBSSO_LOGIN_URL = `https://${constants.DOMAIN}/nusso/XUI/?realm=${constants.REALM}#login&authIndexType=service&authIndexValue=${isDuoRequired ? constants.LDAP_AND_DUO_TREE : constants.LDAP_TREE}&goto=${redirectUrl}`;
    return WEBSSO_LOGIN_URL;
  },

  /**
   * Get the user's netid
   * @async
   * @param {sessionInfoResponse} sessionInfo - The response from the session info service (status, body)
   * @returns {String} the logged in user's netid if it exists in the session info (null otherwise)
   */
  getNetID(sessionInfo) {
    return sessionInfo.data[constants.NETID_PROPERTY_NAME];
  },

};
