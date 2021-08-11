const axios = require('axios');
const constants = require('./constants');
const { AgentlessWebssoError } = require('./model/AgentlessWebssoError');

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
   * @param {String} apigeeEnv - The apigee environnment to call (dev, test, prod)
   * @param {String} apigeeApiKey - The application's apigee apikey
   * @returns {sessionInfoResponse} Returns an object with the sessionInfo request status and request body
   */
  async getSessionInfo(tokenId, apigeeEnv, apigeeApiKey) {
    const url = `https://northwestern-${apigeeEnv}.apigee.net/${constants.APIGEE_PROXY_NAME}/${constants.APIGEE_SESSION_INFO_PATH}`;
    const requestHeaders = {
      'webssotoken': tokenId,
      'apikey': apigeeApiKey,
      'Content-Type': 'application/json',
    };

    try {
      const sessionInfoResponse = await axios.get(url, { headers: requestHeaders });
      return {
        status: sessionInfoResponse.status,
        data: sessionInfoResponse.data,
      };
    } catch (err) {
      if (err.response && err.response.data && err.response.data.fault && err.response.data.fault.faultstring) {
      // NOTE Apigee returns a 500 status when the cookie is not valid even though OpenAM returns a 401 when the cookie is not valid 
        if (err.response.data.fault.faultstring.includes("ResponseCode 401 is treated as error")){
          // console.log('nusso node package | Apigee AgentlessWebsso returned 500 when cookie not logged in. returning 401 openAM body for use with isLoggedIn method instead of throwing 500');
          return {
            "code": 401,
            "reason": "Unauthorized",
            "message": "Access Denied"
          };
        } 
      } else if (err.response && err.response.data && err.response.status) {
        throw new AgentlessWebssoError('Error getting session info for cookie', err.response.status, err.response.data);
      } else {
        throw new AgentlessWebssoError('Error getting session info for cookie', 500, err);
      }
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
          if (sessionInfo.data.properties[constants.DUO_PROPERTY_NAME] == 'true') {
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
   * @async
   * @param {Boolean} isDuoRequired - Whether to generate a url for login-only or login+duo
   * @param {String} redirectUrl - the url to redirect to once login is successfully completed
   * @param {String} apigeeEnv - The apigee environnment to call (dev, test, prod)
   * @param {String} apigeeApiKey - the application's api key
   * @returns {String} A websso login url
   */
  async getLoginUrl(isDuoRequired, redirectUrl, apigeeEnv, apigeeApiKey) {
    const url = `https://northwestern-${apigeeEnv}.apigee.net/${constants.APIGEE_PROXY_NAME}/${isDuoRequired ? constants.APIGEE_LDAP_AND_DUO_PATH : constants.APIGEE_LDAP_ONLY_PATH}`;
    const requestHeaders = {
      'Content-Type': 'application/json',
      'goto': redirectUrl,
      'apikey': apigeeApiKey,
    };

    try {
      const sessionInfoResponse = await axios.get(url, { headers: requestHeaders });
      return sessionInfoResponse.data.redirecturl;
    } catch (err) {
      if (err.response && err.response.status && err.response.data) {
        throw new AgentlessWebssoError('Error getting sso login url', err.response.status, err.response.data);
      } else {
        throw new AgentlessWebssoError('Error getting sso login url', 500, err);
      }
    }
  },

    /**
   * Get the url for redirect to websso logout
   * @async
   * @param {String} apigeeEnv - The apigee environnment to call (dev, test, prod)
   * @param {String} apigeeApiKey - the application's api key
   * @returns {String} A websso logout url
   */
  async getLogoutUrl(apigeeEnv, apigeeApiKey) {
    const url = `https://northwestern-${apigeeEnv}.apigee.net/${constants.APIGEE_PROXY_NAME}/logout`;
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const sessionInfoResponse = await axios.get(url, { headers: requestHeaders });

      return sessionInfoResponse.data.url;
    } catch (err) {
      if (err.response && err.response.status && err.response.data) {
        throw new AgentlessWebssoError('Error getting sso logout url', err.response.status, err.response.data);
      } else {
        throw new AgentlessWebssoError('Error getting sso logout url', 500, err);
      }
    }
  },

  /**
   * Get the user's netid
   * @param {sessionInfoResponse} sessionInfo - The response from the session info service (status, body)
   * @returns {String} the logged in user's netid if it exists in the session info (null otherwise)
   */
  getNetID(sessionInfo) {
    return sessionInfo.data[constants.NETID_PROPERTY_NAME];
  },

};
