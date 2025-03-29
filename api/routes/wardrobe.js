var express = require('express')
var router = express.Router()
var hashMD5 = require('../hash/md5')
const isBase64 = require('is-base64')
const { Jimp } = require("jimp");
const fs = require('fs');

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


AddWardrobeValidation = checkSchema(
  {
    ItemImage:
    {
      notEmpty: true,
      errorMessage: 'Please send wardrobe item picture.',
    },
  },
  ["body"]
)


router.post('/add', AddWardrobeValidation, async function(req, res, next) {
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

    /*if (!isBase64(req.body.ItemImage, { mimeRequired: true }))
        errors.push('Please send wardrobe item picture.')*/
  }

  var img = null

  if (errors.length == 0)
  {
    console.log(req.body.ItemImage)
    img = await Jimp.read(req.body.ItemImage)
  
    if (img == null || img.bitmap.width == 0 || img.bitmap.height == 0)
        errors.push('Please send a valid wardrobe item picture.')
  }

  if (errors.length == 0)
  {
    console.log('Image is valid with size: ' + img.width + 'x' + img.height)

    await img.write('data/wardrobe/file.png')

    res.send(
        {
          Result: true,
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
