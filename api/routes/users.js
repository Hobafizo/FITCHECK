var express = require('express')
var router = express.Router()
var hashMD5 = require('../hash/md5')

var sql = require('mssql/msnodesqlv8')
var dbOp = require('../sql/dbOperations')
var email = require('../email/emailService')

const {
  check,
  body,
  // ...
  validationResult,
  checkSchema,
} = require("express-validator");


ProfileUpdateValidation = checkSchema(
  {
    FirstName:
    {
      notEmpty: true,
      isLength:
      {
        options: { max: 20 },
        errorMessage: 'Your first name must be below 20 chars.',
      },
      errorMessage: 'Please enter a valid first name.',
    },
    
    LastName:
    {
      notEmpty: true,
      isLength:
      {
        options: { max: 20 },
        errorMessage: 'Your last name must be below 20 chars.',
      },
      errorMessage: 'Please enter a valid last name.',
    },

    Gender:
    {
      notEmpty: true,
      isIn: { options: ['M', 'F'] },
      errorMessage: 'Please enter a valid gender.',
    },

    BirthDate:
    {
      isDate: true,
      errorMessage: 'Please enter a valid date.',
    },

    PhoneNum:
    {
      optional: true,
      isMobilePhone: true,
      errorMessage: 'Please enter a valid phone number.',
    },

    Password:
    {
      notEmpty: true,
      isLength:
      {
        options: { min: 6, max: 20 },
        errorMessage: 'Your password must be between 6 ~ 20 chars.',
      },
      errorMessage: 'Please enter a valid password.',
    },

    NewPassword:
    {
      optional: true,
      isLength:
      {
        options: { min: 6, max: 20 },
        errorMessage: 'Your password must be between 6 ~ 20 chars.',
      },
    },
  },
  ["body"]
)


router.post('/updateprofile', ProfileUpdateValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user == null)
    errors.push('You are not logged in!')

  else if (!req.session.user.Verified)
    errors.push('Your account must be verified to perform this action.')

  else
  {
    // extract the data validation result
    const result = validationResult(req)
    
    if (!result.isEmpty())
    {
      for (var i = 0; i < result.array().length; ++i)
        errors.push(result.array()[i].msg)
    }

    if (req.body.NewPassword != null && req.body.NewPassword != req.body.NewPasswordConfirm)
      errors.push('New password confirmation does not match given password.')
  }

  if (errors.length == 0)
  {
    const pw = hashMD5(req.body.Password)
    const fname = req.body.FirstName
    const lname = req.body.LastName
    const gender = req.body.Gender
    const birthdate = req.body.BirthDate
    const phone = req.body.PhoneNum
    var newpw = req.body.NewPassword

    if (newpw != null)
      newpw = hashMD5(newpw)

    var query = await dbOp.request()

    await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('Password', sql.VarChar(50), pw)
        .input('FirstName', sql.VarChar(50), fname)
        .input('LastName', sql.VarChar(50), lname)
        .input('Gender', sql.Char(1), gender)
        .input('BirthDate', sql.SmallDateTime, birthdate)
        .input('PhoneNum', sql.VarChar(14), phone)
        .input('NewPassword', sql.VarChar(50), newpw)
        .execute('[dbo].[OnUserUpdate]', (err, result) =>
        {
          if (err != null)
          {
            errors.push('An error occurred while performing this action, report this to an admin.')
            console.log(err)
          }

          if (result != null)
          {
            switch (result.returnValue)
            {
              case 2:
                errors.push('Current password is incorrect, please try again.')
                break

              case 1:
              case 3:
                errors.push('An error occurred during registration, try again later.')
                break
            }
          }

          if (errors.length > 0)
          {
            res.send(
              {
                Result: false,
                Errors: errors,
              })
          }
  
          else
          {
            var user = result.recordset[0]

            req.session.user = user
            req.session.save()
            
            res.send(
              {
                Result: true,
                UserID: user.UserID,
                FirstName: user.FirstName,
                LastName: user.LastName,
                Email: user.Email,
                Verified: user.Verified,
              })
          }
        })
  }

  else
  {
    res.send(
    {
      Result: false,
      Errors: errors,
    })
  }
});


SavePreferencesValidation = checkSchema(
  {
    Preferences:
    {
      notEmpty: true,
      isArray: true,
      errorMessage: 'Please enter your favorite preferences.',
    },
  },
  ["body"]
)


router.post('/savepreferences', SavePreferencesValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user == null)
    errors.push('You are not logged in!')

  else if (!req.session.user.Verified)
    errors.push('Your account must be verified to perform this action.')

  else
  {
    // extract the data validation result
    const result = validationResult(req)
    
    if (!result.isEmpty())
    {
      for (var i = 0; i < result.array().length; ++i)
        errors.push(result.array()[i].msg)
    }
  }

  if (errors.length == 0)
  {
    const prefs = req.body.Preferences

    const tvp = new sql.Table()
    tvp.name = 'TagList'
    tvp.columns.add('Class', sql.VarChar(50))
    tvp.columns.add('Tag', sql.VarChar(50))

    for (var i = 0; i < prefs.length; ++i)
    {
      tvp.rows.add(prefs[i].Class, prefs[i].Tag)
    }

    var query = await dbOp.request()

    await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('Preferences', sql.TVP, tvp)
        .execute('[dbo].[OnUserPreferencesSave]', (err, result) =>
        {
          if (err != null)
          {
            errors.push('An error occurred while performing this action, report this to an admin.')
            console.log(err)
          }

          if (result != null)
          {
            switch (result.returnValue)
            {
              case 1:
                errors.push('An error occurred while saving preferences, try again later.')
                break
            }
          }

          if (errors.length > 0)
            {
              res.send(
                {
                  Result: false,
                  Errors: errors,
                })
            }
    
            else
            {
              res.send(
                {
                  Result: true,
                })
            }
        })
  }

  else
  {
    res.send(
    {
      Result: false,
      Errors: errors,
    })
  }
});

module.exports = router;
