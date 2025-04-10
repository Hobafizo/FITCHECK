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


LoginValidation = checkSchema(
  {
    Email:
    {
      isEmail: true,
      isLength:
      {
        options: { min: 6, max: 24 },
        errorMessage: 'Your email must be between 6 ~ 24 chars.',
      },
      errorMessage: 'Please enter a valid email.',
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
  },
  ["body"]
)


router.post('/login', LoginValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')

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
    const email = req.body.Email
    const pw = hashMD5(req.body.Password)

    var query = await dbOp.request()

    await query
        .input('Email', sql.VarChar(50), email)
        .input('Password', sql.VarChar(50), pw)
        .execute('[dbo].[OnUserLogin]', (err, result) =>
        {
          if (err != null)
          {
            errors.push('An error occurred while performing this action, report this to an admin.')
            console.log(err)
          }

          if (result != null)
          {
            if (result.returnValue == 1 || result.recordsets.length == 0 || result.recordset.length == 0)
              errors.push('Email or password is incorrect, please try again.')
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

              GetUserWardrobe(user, req.session)

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


async function SendUserVerifyCode(user, session)
{
  var query = await dbOp.request()

  await query
      .input('UserID', sql.Int, user.UserID)
      .execute('[dbo].[GenerateUserVerifyCode]', (err, result) =>
      {
        if (err != null)
        {
          console.log(err)
        }

        if (result == null || result.returnValue != 0)
        {
          return
        }

        var code = result.recordset[0].VerifyCode

        session.user.VerifyCode = code
        session.save()

        email.SendMailDoc('verify_mail.html', user.Email, user.FirstName, 'Welcome to FitCheck - Registration Code',
          [
            { from: '@VerifyCode', to: code },
          ],
          [
            {
              filename: 'img-01.png',
              path: 'public/images/email/img-01.png',
              cid: 'img-01@fitcheck.com'
            },
        
            {
              filename: 'facebook-logo-black.png',
              path: 'public/images/email/facebook-logo-black.png',
              cid: 'facebook-logo-black@fitcheck.com'
            },
        
            {
              filename: 'instagram-logo-black.png',
              path: 'public/images/email/instagram-logo-black.png',
              cid: 'instagram-logo-black@fitcheck.com'
            },
        
            {
              filename: 'x-logo-black.png',
              path: 'public/images/email/x-logo-black.png',
              cid: 'x-logo-black@fitcheck.com'
            },
        
            {
              filename: 'youtube-logo-black.png',
              path: 'public/images/email/youtube-logo-black.png',
              cid: 'youtube-logo-black@fitcheck.com'
            },
          ]
        )
      })
}


async function GetUserWardrobe(user, session)
{
  var query = await dbOp.request()

  await query
      .input('UserID', sql.Int, user.UserID)
      .execute('[dbo].[GetWardrobeItems]', (err, result) =>
      {
        if (err != null)
        {
          console.log(err)
        }

        if (result == null || result.returnValue != 0 || result.recordsets == null || result.recordsets.length != 2)
        {
          return
        }

        var wardrobe = []
        var item
        var tags = []
        var b = 0

        for (var i = 0; i < result.recordsets[0].length; ++i)
        {
          item = result.recordsets[0][i]
          tags = [];
          
          while (b < result.recordsets[1].length && result.recordsets[1][b].ItemID == item.ItemID)
          {
            tags.push(
            {
                TagID: result.recordsets[1][b]['TagID'],
                Class: result.recordsets[1][b]['Class'],
                Tag: result.recordsets[1][b]['Tag'],
            })
            b++;
          }

          item.Tags = tags
          wardrobe.push(item)
        }

        session.wardrobe = wardrobe
        session.save()
      })
}


async function SendUserForgetCode(res, userEmail)
{
  var errors = [];
  var query = await dbOp.request()

  await query
      .input('Email', sql.VarChar(50), userEmail)
      .execute('[dbo].[GenerateUserForgetCode]', (err, result) =>
      {
        if (err != null)
        {
          errors.push('An error occurred while performing this action, report this to an admin.')
          console.log(err)
        }

        if (result != null)
        {
          if (result.returnValue != 0)
          {
            errors.push('Could not find user with specified email.')
          }
        }

        if (errors.length > 0)
        {
          res.send(
          {
            Result: false,
            Errors: errors,
          })
          return
        }

        var forgetinfo = result.recordset[0]

        res.send(
        {
          Result: true,
        })

        email.SendMailDoc('forget_pw.html', userEmail, forgetinfo.FirstName, 'Forget Password Code',
          [
            { from: '@VerifyCode', to: forgetinfo.ForgetCode },
          ],
          [
            {
              filename: 'img-02.png',
              path: 'public/images/email/img-02.png',
              cid: 'img-02@fitcheck.com'
            },
        
            {
              filename: 'facebook-logo-black.png',
              path: 'public/images/email/facebook-logo-black.png',
              cid: 'facebook-logo-black@fitcheck.com'
            },
        
            {
              filename: 'instagram-logo-black.png',
              path: 'public/images/email/instagram-logo-black.png',
              cid: 'instagram-logo-black@fitcheck.com'
            },
        
            {
              filename: 'x-logo-black.png',
              path: 'public/images/email/x-logo-black.png',
              cid: 'x-logo-black@fitcheck.com'
            },
        
            {
              filename: 'youtube-logo-black.png',
              path: 'public/images/email/youtube-logo-black.png',
              cid: 'youtube-logo-black@fitcheck.com'
            },
          ]
        )
      })
}


CheckEmailValidation = checkSchema(
  {
    Email:
    {
      isEmail: true,
      isLength:
      {
        options: { min: 6, max: 24 },
        errorMessage: 'Your email must be between 6 ~ 24 chars.',
      },
      errorMessage: 'Please enter a valid email.',
    },
  },
  ["body"]
)


router.post('/checkemail', CheckEmailValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')

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
    const email = req.body.Email

    var query = await dbOp.request()

    await query
        .input('Email', sql.VarChar(50), email)
        .execute('[dbo].[CheckValidEmail]', (err, result) =>
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
                errors.push('An existing account already uses this email.')
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


RegisterValidation = checkSchema(
  {
    Email:
    {
      isEmail: true,
      isLength:
      {
        options: { min: 6, max: 24 },
        errorMessage: 'Your email must be between 6 ~ 24 chars.',
      },
      errorMessage: 'Please enter a valid email.',
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
  },
  ["body"]
)


router.post('/register', RegisterValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')

  else
  {
    // extract the data validation result
    const result = validationResult(req)
    
    if (!result.isEmpty())
    {
      for (var i = 0; i < result.array().length; ++i)
        errors.push(result.array()[i].msg)
    }

    if (req.body.Password != req.body.PasswordConfirm)
      errors.push('Password confirmation does not match given password.')
  }

  if (errors.length == 0)
  {
    const email = req.body.Email
    const pw = hashMD5(req.body.Password)
    const fname = req.body.FirstName
    const lname = req.body.LastName
    const gender = req.body.Gender
    const birthdate = req.body.BirthDate
    const phone = req.body.PhoneNum

    var query = await dbOp.request()

    await query
        .input('Email', sql.VarChar(50), email)
        .input('Password', sql.VarChar(50), pw)
        .input('FirstName', sql.VarChar(50), fname)
        .input('LastName', sql.VarChar(50), lname)
        .input('Gender', sql.Char(1), gender)
        .input('BirthDate', sql.SmallDateTime, birthdate)
        .input('PhoneNum', sql.VarChar(14), phone)
        .execute('[dbo].[OnUserRegister]', (err, result) =>
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
                errors.push('Birth date value is invalid.')
                break

              case 2:
                errors.push('An existing account already uses this email.')
                break

              case 3:
              case 4:
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

              GetUserWardrobe(user, req.session)
              SendUserVerifyCode(user, req.session)

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


VerifyEmailValidation = checkSchema(
  {
    VerifyCode:
    {
      notEmpty: true,
      errorMessage: 'Please enter verify code that was sent to your email.',
    },
  },
  ["body"]
)


router.post('/verifyemail', VerifyEmailValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user == null)
    errors.push('You are not logged in!')

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
    const code = req.body.VerifyCode
    if (req.session.user.Verified == true)
    {
      errors.push('Your email is already verified.')
    }
    else if (code != req.session.user.VerifyCode)
    {
      errors.push('Verify code is incorrect, please check your email and try again.')
    }

    if (errors.length == 0)
    {
      var query = await dbOp.request()

      await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('Verified', sql.Bit, 1)
        .execute('[dbo].[SetUserVerifyStatus]', (err, result) =>
        {
          if (err != null)
          {
            errors.push('An error occurred while performing this action, report this to an admin.')
            console.log(err)
          }

          if (result != null)
          {
            if (result.returnValue != 0)
            {
              errors.push('An error occurred during email verification, try again later.')
            }
          }

          if (errors.length == 0)
          {
            req.session.user.Verified = true
            req.session.save()

            res.send(
              {
                Result: true,
              })
          }
        })
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
});


GetForgetPasswordValidation = checkSchema(
  {
    Email:
    {
      isEmail: true,
      isLength:
      {
        options: { min: 6, max: 24 },
        errorMessage: 'Your email must be between 6 ~ 24 chars.',
      },
      errorMessage: 'Please enter a valid email.',
    },
  },
  ["body"]
)


router.post('/reqforgetpw', GetForgetPasswordValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')
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
    SendUserForgetCode(res, req.body.Email)
  }

  else
  {
    res.send(
    {
      Result: false,
      Errors: errors,
    })
  }
})


ForgetPasswordValidation = checkSchema(
  {
    ForgetCode:
    {
      notEmpty: true,
      errorMessage: 'Please enter the code that was sent to your email.',
    },

    Email:
    {
      isEmail: true,
      isLength:
      {
        options: { min: 6, max: 24 },
        errorMessage: 'Your email must be between 6 ~ 24 chars.',
      },
      errorMessage: 'Please enter a valid email.',
    },

    Password:
    {
      notEmpty: true,
      isLength:
      {
        options: { min: 6, max: 20 },
        errorMessage: 'Your new password must be between 6 ~ 20 chars.',
      },
      errorMessage: 'Please enter a valid password.',
    },
  },
  ["body"]
)


router.post('/forgetpw', ForgetPasswordValidation, async function(req, res, next) {
  var errors = [];

  if (req.session.user != null)
    errors.push('You are already logged in!')
  else
  {
    // extract the data validation result
    const result = validationResult(req)
    
    if (!result.isEmpty())
    {
      for (var i = 0; i < result.array().length; ++i)
        errors.push(result.array()[i].msg)
    }

    if (req.body.Password != req.body.PasswordConfirm)
      errors.push('Password confirmation does not match given password.')
  }

  if (errors.length == 0)
  {
    const email = req.body.Email
    const pw = hashMD5(req.body.Password)
    const code = req.body.ForgetCode

    if (errors.length == 0)
    {
      var query = await dbOp.request()

      await query
        .input('Email', sql.VarChar(50), email)
        .input('NewPassword', sql.VarChar(50), pw)
        .input('ForgetCode', sql.VarChar(20), code)
        .execute('[dbo].[OnForgetPassword]', (err, result) =>
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
                errors.push('Could not find user with specified email, try again later.')
                break

              case 2:
                errors.push('Forget password code is incorrect, please check your email and try again.')
                break

              case 3:
                errors.push('An error occurred while processing forget password request, try again later.')
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
  }

  if (errors.length > 0)
  {
    res.send(
      {
        Result: false,
        Errors: errors,
      })
  }
});


router.get('/logout', async function(req, res, next) {
  if (req.session.user != null)
    req.session.destroy();

  res.send(
    {
      Result: true,
    })
})

module.exports = router;
