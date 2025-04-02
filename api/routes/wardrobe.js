var express = require('express')
var router = express.Router()
var hashMD5 = require('../hash/md5')
const isBase64 = require('is-base64')
const multer = require('multer')
const { Jimp } = require("jimp");
const fs = require('fs');
var path = require('path');
const crypto = require("crypto");

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


router.get('/', async function(req, res, next) {
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

  if (errors.length > 0)
  {
    res.send(
      {
        Result: false,
        Errors: errors,
      })
    return
  }

  var items = []

  if (req.session.wardrobe != null && req.session.wardrobe.length > 0)
  {
    for (var i = 0; i < req.session.wardrobe.length; ++i)
    {
      items.push(
      {
        ItemID: req.session.wardrobe[i].ItemID,
        ItemName: req.session.wardrobe[i].ItemName,
        BrandName: req.session.wardrobe[i].BrandName,
        ImagePath: req.session.wardrobe[i].ImagePath,
        Status: req.session.wardrobe[i].Status,
      })
    }
  }
  
  res.send(
  {
    Result: true,
    Items: items
  })
});


const storage = multer.memoryStorage()
const upload = multer({ dest: 'uploads/', storage: storage, limits: { fileSize: 1000 * 1 * 10000 } })


async function SegmentImages(session, sessionID, sessionStore, images)
{
  try
  {
    var imgs = []
    for (var i = 0; i < images.length; ++i)
      imgs.push(images[i].FullPath)

    const values = { Images: imgs }

    const res = await fetch(
    process.env.AI_API_HOST + "/segment",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }
    )

    const data = await res.json()
    if (data.length == 0)
      return
    
    const appDir = path.dirname(require.main.filename).replace('api\\bin', 'api') + '\\'
    var imgsToUpdate = []

    const tvp = new sql.Table()
    tvp.name = 'WardrobeItemsToUpdate'
    tvp.columns.add('ImagePath', sql.VarChar(200))
    tvp.columns.add('CleanPath', sql.VarChar(200))

    for (var i = 0; i < data.length; ++i)
    {
      if (data[i].Result == true)
      {
        tvp.rows.add(
          data[i].ImagePath.replace(appDir, ''),
          data[i].OutputPath.replace(appDir, '')
        )
      }
    }
    
    var query = await dbOp.request()
    
    await query
        .input('UserID', sql.Int, session.user.UserID)
        .input('Items', sql.TVP, tvp)
        .execute('[dbo].[OnWardrobePostSegmentation]', (err, result) =>
        {
          if (err != null)
          {
            console.log(err)
          }

          if (result.returnValue == 0 && result.recordset != null && result.recordset.length > 0)
          {
            var wardrobe = result.recordset
            
            sessionStore.get(sessionID, (err, newSession) =>
            {
              if (!err && newSession)
              {
                session = newSession
              }

              if (session.wardrobe == null)
                session.wardrobe = wardrobe
              else
              {
                for (var i = 0; i < wardrobe.length; ++i)
                {
                  const index = session.wardrobe.findIndex(item => item.ItemID === wardrobe[i].ItemID);
                  if (index !== -1)
                    session.wardrobe[index] = wardrobe[i]
                  else
                    session.wardrobe.push(wardrobe[i])
                }
              }
  
              sessionStore.set(sessionID, session)
              console.log(session.wardrobe)
            });
          }
        })
  }
  catch (error)
  {
    console.error(error)
  }
}


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


router.post('/add', AddWardrobeValidation, upload.array('ItemImages'), async function(req, res, next) {
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

    if (req.files == null || req.files.length == 0)
      errors.push('Please send wardrobe item picture.')

    /*if (!isBase64(req.file, { mimeRequired: true }))
      errors.push('Please send wardrobe item picture.')*/
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

  var processed_imgs = []
  var img = null

  for (var i = 0; i < req.files.length; ++i)
  {
    if (req.files[i].buffer == null)
      continue

    img = await Jimp.read(req.files[i].buffer)
    if (img == null || img.bitmap.width == 0 || img.bitmap.height == 0)
      continue

    const appDir = path.dirname(require.main.filename).replace('api\\bin', 'api')
    const relativePath = 'data\\wardrobe\\' + crypto.randomBytes(16).toString("hex") + '.png'
    const fullPath = appDir + '\\' + relativePath

    await img.write(relativePath)
    processed_imgs.push(
    {
      ItemName: '',
      BrandName: '',
      RelativePath: relativePath,
      FullPath: fullPath,
      Status: 2
    })
  }

  const tvp = new sql.Table()
  tvp.name = 'WardrobeItemList'
  tvp.columns.add('ItemName', sql.VarChar(50), {nullable: true})
  tvp.columns.add('BrandName', sql.VarChar(50), {nullable: true})
  tvp.columns.add('ImagePath', sql.VarChar(200))
  tvp.columns.add('Status', sql.TinyInt)

  for (var i = 0; i < processed_imgs.length; ++i)
  {
    tvp.rows.add(processed_imgs[i].ItemName, processed_imgs[i].BrandName, processed_imgs[i].RelativePath, processed_imgs[i].Status)
  }

  const query = (await dbOp.request())
      .input('UserID', sql.Int, req.session.user.UserID)
      .input('Items', sql.TVP, tvp)

  const result = await query.execute('[dbo].[OnWardrobeItemsAddon]')
  if (result == null)
  {
    errors.push('An error occurred while performing this action, report this to an admin.')
  } 
  else
  {
    switch (result.returnValue)
    {
      case 1:
        errors.push('An error occurred while saving preferences, try again later.')
        break 
      case 2:
        errors.push('Failed to process sent items, please try again.')
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

  else if (result.recordset != null && result.recordset.length > 0)
  {
    var wardrobe = result.recordset

    if (req.session.wardrobe == null)
      req.session.wardrobe = wardrobe
    else
    {
      for (var i = 0; i < wardrobe.length; ++i)
      {
        const index = req.session.wardrobe.findIndex(item => item.ItemID === wardrobe[i].ItemID);
        if (index !== -1)
          req.session.wardrobe[index] = wardrobe[i]
        else
          req.session.wardrobe.push(wardrobe[i])
      }
    }

    req.session.save()
    console.log(req.session.wardrobe)

    res.send(
    {
      Result: true,
      Items: processed_imgs.length
    })

    SegmentImages(req.session, req.sessionID, req.sessionStore, processed_imgs)
  }
});

module.exports = router;
