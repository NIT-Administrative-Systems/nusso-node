/** @module Constants */

/**
 * The name of the NU SSO cookie
 * @constant
 * @type {string}
*/
const SSO_COOKIE_NAME = 'nusso';

/**
 * The name of the netid property in the Session Info returned by the service
 * @constant
 * @type {string}
*/
const NETID_PROPERTY_NAME = 'username';

/**
 * The name of the duo auth true/false property in the Session Info returned by the service
 * @constant
 * @type {string}
*/
const DUO_PROPERTY_NAME = 'isDuoAuthenticated';

/**
 * The domain name
 * @constant
 * @type {string}
*/
const DOMAIN = 'dev-websso.it.northwestern.edu';

/**
 * The OpenAM realm name for Northwestern config
 * @constant
 * @type {string}
*/
const REALM = 'northwestern';

/**
 * The name of the LDAP only tree
 * @constant
 * @type {string}
*/
const LDAP_TREE = 'ldap-registry';

/**
 * The name of the LDAP with DUO tree if DUO is required
 * @constant
 * @type {string}
*/
const LDAP_AND_DUO_TREE = 'ldap-and-duo';

module.exports = {
  SSO_COOKIE_NAME,
  NETID_PROPERTY_NAME,
  DUO_PROPERTY_NAME,
  DOMAIN,
  REALM,
  LDAP_TREE,
  LDAP_AND_DUO_TREE,
};
