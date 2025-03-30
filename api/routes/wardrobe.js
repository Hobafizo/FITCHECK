var express = require('express')
var router = express.Router()
var hashMD5 = require('../hash/md5')
const isBase64 = require('is-base64')
const multer = require('multer')
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
    /*ItemImage:
    {
      notEmpty: true,
      errorMessage: 'Please send wardrobe item picture.',
    },*/
  },
  ["body"]
)

const storage = multer.memoryStorage()
const upload = multer({ dest: 'uploads/', storage: storage, limits: { fileSize: 1000 * 1 * 10000 } })


router.post('/add', AddWardrobeValidation, upload.array(), async function(req, res, next) {
  var errors = [];

  if (true == false)
  //if (req.session.user == null)
    errors.push('You are not logged in!')

  /*else if (!req.session.user.Verified)
    errors.push('Your account must be verified to perform this action.')*/

  else
  {
    // extract the data validation result
    const result = validationResult(req)
    
    if (!result.isEmpty())
    {
      for (var i = 0; i < result.array().length; ++i)
        errors.push(result.array()[i].msg)
    }

    console.log(req.files)

    if (req.files == null || req.files.length == 0)
      errors.push('Please send wardrobe item picture.')

    /*if (!isBase64(req.file, { mimeRequired: true }))
      errors.push('Please send wardrobe item picture.')*/
  }

  if (errors.length == 0)
  {
    var processed_imgs = 0
    var img = null

    for (var i = 0; i < req.files.length; ++i)
    {
      if (req.files[i].buffer == null)
        continue

      img = await Jimp.read(req.files[i].buffer)
      if (img == null || img.bitmap.width == 0 || img.bitmap.height == 0)
        continue

      console.log('Image is valid with size: ' + img.width + 'x' + img.height)

      await img.write('data/wardrobe/file.png')

      processed_imgs++
    }

    res.send(
    {
      Result: true,
      AddedItems: processed_imgs
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
