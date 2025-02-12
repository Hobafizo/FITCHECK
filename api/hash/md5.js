var crypto = require('crypto')

function hashMD5(str)
{
  return crypto.createHash('md5').update(str).digest('hex')
}

module.exports = hashMD5;