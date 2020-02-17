/** @module Constants */

/**
 * The name of the NU SSO cookie
 * @constant
 * @type {string}
*/
const SSO_COOKIE_NAME = 'nusso';

/**
 * The name of the netid property in the Session Info returned by Apigee proxy
 * @constant
 * @type {string}
*/
const NETID_PROPERTY_NAME = 'username';

/**
 * The name of the duo auth true/false property in the Session Info returned by Apigee proxy
 * @constant
 * @type {string}
*/
const DUO_PROPERTY_NAME = 'isDuoAuthenticated';

/**
 * The apigee proxy 
 * @constant
 * @type {string}
*/
const APIGEE_PROXY_NAME = 'agentless-websso';


/**
 * The name of the validate path in Apigee proxy
 * @constant
 * @type {string}
*/
const APIGEE_VALIDATE_TOKEN_PATH = 'validateWebSSOToken';

/**
 * The name of the LDAP only path in Apigee proxy
 * @constant
 * @type {string}
*/
const APIGEE_LDAP_ONLY_PATH = 'get-ldap-redirect-url';

/**
 * The name of the LDAP with DUO path in Apigee proxy if DUO is required
 * @constant
 * @type {string}
*/
const APIGEE_LDAP_AND_DUO_PATH = 'get-ldap-duo-redirect-url';


/**
 * The name of the session info path in Apigee proxy
 * @constant
 * @type {string}
*/
const APIGEE_SESSION_INFO_PATH = 'session-info';

module.exports = {
  SSO_COOKIE_NAME,
  NETID_PROPERTY_NAME,
  DUO_PROPERTY_NAME,
  APIGEE_BASE_URL,
  APIGEE_PROXY_NAME,
  APIGEE_VALIDATE_TOKEN_PATH,
  APIGEE_SESSION_INFO_PATH,
  APIGEE_LDAP_ONLY_PATH,
  APIGEE_LDAP_AND_DUO_PATH,
};
