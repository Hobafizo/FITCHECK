var express = require('express');
var router = express.Router();
var sql = require('mssql/msnodesqlv8');
var dbOp = require('../sql/dbOperations');
var crypto = require('crypto');

function hashMD5(str)
{
  return crypto.createHash('md5').update(str).digest('hex')
}


router.post('/login', async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')
  else
  {
    if (req.body.Email == null)
      errors.push('Please enter a valid email.')
    if (req.body.Password == null)
      errors.push('Please enter a valid password.')
  }

  if (errors.length == 0)
  {
    const email = req.body.Email
    const pw = hashMD5(req.body.Password)

    var query = await dbOp.request()

    await query
        .input('Email', sql.VarChar(50), email)
        .input('Password', sql.VarChar(50), pw)
        .execute('[dbo].[OnUserLogin]', (err, result) =>
        {
          if (result.returnValue == 1 || result.recordsets.length == 0 || result.recordset.length == 0)
            errors.push('Email or password is incorrect, please try again.')

          if (errors.length > 0)
            {
              res.send(
                {
                  result: false,
                  errors: errors,
                })
            }
    
            else
            {
              var user = result.recordset[0]

              req.session.user = user
              req.session.save()

              res.send(
                {
                  result: true,

                  userid: user['UserID'],
                  firstname: user['FirstName'],
                  lastname: user['LastName'],
                  email: user['Email'],
                  verified: user['Verified'],
                })
            }
        })
  }

  else
  {
    res.send(
    {
      result: false,
      errors: errors,
    })
  }
});


router.get('/logout', async function(req, res, next) {
  if (req.session.user != null)
    req.session.destroy();
  res.redirect('/')
})

module.exports = router;
