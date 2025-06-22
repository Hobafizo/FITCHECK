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
  getWeatherTemp,
  getWeatherSeason
} = require('../weather/weatherService')

const {
  check,
  body,
  // ...
  validationResult,
  checkSchema,
} = require("express-validator");
const { error } = require('console')


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
        Color: req.session.wardrobe[i].Color,
        Status: req.session.wardrobe[i].Status,
        Tags: req.session.wardrobe[i].Tags,
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


function ClearOldImages(images)
{
  for (var i = 0; i < images.length; ++i)
    {
      if (images[i].Result == true)
      {
        try
        {
          const file = fs.statSync(images[i].ImagePath);
          if (file != null)
            fs.unlinkSync(images[i].ImagePath)
        }
        catch (err)
        {
        }        
      }
    }
}

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
    var colorHex

    const tvp = new sql.Table()
    tvp.name = 'WardrobeItemsToUpdate'
    tvp.columns.add('ImagePath', sql.VarChar(200))
    tvp.columns.add('CleanPath', sql.VarChar(200))
    tvp.columns.add('ColorHex', sql.VarChar(6))
    tvp.columns.add('ColorName', sql.VarChar(30))

    for (var i = 0; i < data.length; ++i)
    {
      if (data[i].Result == true)
      {
        colorHex = ""
        for (var b = 0; b < data[i].ColorRGB.length; ++b)
        {
          colorHex += ('00' + data[i].ColorRGB[b].toString(16).toUpperCase()).slice(-2)
        }

        data[i].ColorHex = colorHex

        tvp.rows.add(
          data[i].ImagePath.replace(appDir, ''),
          data[i].OutputPath.replace(appDir, ''),
          data[i].ColorHex,
          data[i].ColorName
        )
      }
    }
    
    var query = (await dbOp.request())
                    .input('UserID', sql.Int, session.user.UserID)
                    .input('Items', sql.TVP, tvp)
    
    const result = await query.execute('[dbo].[OnWardrobePostSegmentation]')
    if (result == null)
      return

    if (result.returnValue == 0 && result.recordsets != null && result.recordsets.length == 2)
    {
      ClearOldImages(data)

      var wardrobe = result.recordsets[0]
      var tags = []
      var b = 0
      
      sessionStore.get(sessionID, (err, newSession) =>
      {
        if (!err && newSession)
        {
          session = newSession
        }

        for (var i = 0; i < wardrobe.length; ++i)
        {
          tags = [];

          while (b < result.recordsets[1].length && result.recordsets[1][b].ItemID == wardrobe[i].ItemID)
          {
            tags.push(
            {
                TagID: result.recordsets[1][b]['TagID'],
                Class: result.recordsets[1][b]['Class'],
                Tag: result.recordsets[1][b]['Tag'],
            })
            b++;
          }

          wardrobe[i].Tags = tags
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
      });
    }
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

    if (
      req.files[i].mimetype != 'image/png'
      && req.files[i].mimetype != 'image/jpg'
      && req.files[i].mimetype != 'image/jpeg'
    )
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

  if (processed_imgs.length == 0)
  {
    errors.push('Failed to process sent items, please try again.')

    res.send(
    {
      Result: false,
      Errors: errors,
    })
    return
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

    res.send(
    {
      Result: true,
      Items: processed_imgs.length
    })

    SegmentImages(req.session, req.sessionID, req.sessionStore, processed_imgs)
  }
});


ModifyWardrobeValidation = checkSchema(
  {
    ItemID:
    {
      notEmpty: true,
      isInt: true,
      errorMessage: 'Please specify which wardrobe item you would like to modify.',
    },
    ItemName:
    {
      optional: true,
      isLength:
      {
        options: { max: 50 },
        errorMessage: 'Item name must be below 50 chars.',
      },
      errorMessage: 'Please send item name.',
    },
    BrandName:
    {
      optional: true,
      isLength:
      {
        options: { max: 50 },
        errorMessage: 'Brand name must be below 50 chars.',
      },
      errorMessage: 'Please send item brand name.',
    },
    Tags:
    {
      optional: true,
      isArray: true,
      errorMessage: 'Please send item tags properly.',
    },
  },
  ["body"]
)


router.post('/modify', ModifyWardrobeValidation, async function(req, res, next) {
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

    if (
      req.body.ItemName == null
      && req.body.BrandName == null
      && req.body.Tags == null
    )
    errors.push('You must at least modify one input.')
  }

  if (errors.length == 0)
  {
    const itemid = req.body.ItemID
    const itemname = req.body.ItemName
    const brandname = req.body.BrandName
    const tags = req.body.Tags

    const tvp = new sql.Table()
    tvp.name = 'TagList'
    tvp.columns.add('Class', sql.VarChar(50))
    tvp.columns.add('Tag', sql.VarChar(50))
  
    if (tags != null)
    {
      for (var i = 0; i < tags.length; ++i)
      {
        if (tags[i].Class != null && tags[i].Tag != null)
        {
          tvp.rows.add(tags[i].Class, tags[i].Tag)
        }
      }
    }

    var query = await dbOp.request()

    await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('ItemID', sql.Int, itemid)
        .input('ItemName', sql.VarChar(50), itemname)
        .input('BrandName', sql.VarChar(50), brandname)
        .input('Tags', sql.TVP, tvp)
        .execute('[dbo].[OnWardrobeItemModify]', (err, result) =>
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
                errors.push('An error occurred while modfiying wardrobe item, try again later.')
                break

              case 2:
              case 3:
                errors.push('Could not find this item, please reload and try again.')
                break
            }
          }

          if (result.recordsets == null || result.recordsets.length != 2 || result.recordsets[0].length == 0)
            errors.push('An error occurred while modfiying wardrobe item, try again later.')

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
            var item = result.recordsets[0][0]
            var tags = []
            var b = 0

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

            const index = req.session.wardrobe.findIndex(it => it.ItemID === item.ItemID);
            if (index !== -1)
              req.session.wardrobe[index] = item
            else
              req.session.wardrobe.push(item)

            req.session.save()

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


DeleteWardrobeValidation = checkSchema(
  {
    ItemID:
    {
      notEmpty: true,
      isInt: true,
      errorMessage: 'Please specify which wardrobe item you would like to delete.',
    },
  },
  ["body"]
)


router.post('/delete', DeleteWardrobeValidation, async function(req, res, next) {
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
    const itemid = req.body.ItemID

    var query = await dbOp.request()

    await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('ItemID', sql.Int, itemid)
        .execute('[dbo].[OnWardrobeItemDelete]', (err, result) =>
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
                errors.push('An error occurred while deleting wardrobe item, try again later.')
                break

              case 2:
                errors.push('Could not find this item, please reload and try again.')
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
            const index = req.session.wardrobe.findIndex(item => item.ItemID === itemid);
            if (index !== -1)
            {
              req.session.wardrobe.splice(index, 1)
            }

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


OutfitRecommendationValidation = checkSchema(
  {
    CheckWeather:
    {
      notEmpty: false,
      isBoolean: true,
      errorMessage: 'Please specify if you want to automatically check the weather for you.',
    },
    LocationLat:
    {
      optional: true,
      isFloat: true,
      errorMessage: 'Please provide a valid map location lat point.',
    },
    LocationLon:
    {
      optional: true,
      isFloat: true,
      errorMessage: 'Please provide a valid map location lon point.',
    },
    FilterTags:
    {
      optional: true,
      isArray: true,
      errorMessage: 'Please send filter tags properly.',
    },
  },
  ["body"]
)


router.post('/getrecommendation', OutfitRecommendationValidation, async function(req, res, next) {
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

    if (req.body.CheckWeather != null && req.body.CheckWeather == true)
    {
      if (req.body.LocationLat == null)
        errors.push('Please provide a map location lat point.')
      if (req.body.LocationLon == null)
        errors.push('Please provide a map location lon point.')
    }
  }

  if (errors.length == 0 && req.body.CheckWeather == true)
  {
    var seasons = await getWeatherSeason(req.body.LocationLat, req.body.LocationLon)
    if (seasons != null)
    {
      const seasontags = seasons?.map((s) => ({ 'Class': 'Season', 'Tag': s }))
      for (var i = 0; i < seasontags.length; ++i)
        req.body.FilterTags.push(seasontags[i])
    }
    else
      errors.push('Failed to retrieve weather information, please try again.')
  }

  if (errors.length == 0)
  {
    const tags = req.body.FilterTags

    const tvp = new sql.Table()
    tvp.name = 'TagList'
    tvp.columns.add('Class', sql.VarChar(50))
    tvp.columns.add('Tag', sql.VarChar(50))
  
    if (tags != null)
    {
      for (var i = 0; i < tags.length; ++i)
      {
        if (tags[i].Class != null && tags[i].Tag != null)
        {
          tvp.rows.add(tags[i].Class, tags[i].Tag)
        }
      }
    }

    var query = await dbOp.request()

    await query
        .input('UserID', sql.Int, req.session.user.UserID)
        .input('Filters', sql.TVP, tvp)
        .execute('[dbo].[GenerateOutfit]', (err, result) =>
        {
          if (err != null)
          {
            errors.push('An error occurred while performing this action, report this to an admin.')
            console.log(err)
          }

          if (result == null || result.returnValue != 0 || result.recordsets == null || result.recordsets.length != 1)
            errors.push('An error occurred during outfit recommendation, try again later.')

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
            var suggestions = result.recordsets[0]

            if (req.session.suggestions == null)
              req.session.suggestions = suggestions
            else
            {
              for (var i = 0; i < suggestions.length; ++i)
                req.session.suggestions.push(suggestions[i])
            }

            res.send(
            {
              Result: true,
              Suggestions: suggestions?.map((s) => (
              {
                'SugID': s['SugID'],
                'ItemID': s['ItemID']
              }))
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


router.get('/recommendations', async function(req, res, next) {
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
    const SuggestionMax = 5;
    var suggestions_count = 0, cur_sug = 0

    const suggestions = req.session.suggestions
    var output = []

    for (var i = suggestions.length - 1; i >= 0; --i)
    {
      if (suggestions[i]['SugID'] != cur_sug)
      {
        cur_sug = suggestions[i]['SugID']
        if (++suggestions_count > SuggestionMax)
          break
      }

      output.push(suggestions[i])
    }

    res.send(
    {
      Result: true,
      Suggestions: output?.map((s) => (
      {
        'SugID': s['SugID'],
        'ItemID': s['ItemID']
      }))
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


router.get('/outfits', async function(req, res, next) {
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
    const outfits = req.session.outfits;

    res.send(
    {
      Result: true,
      Outfits: outfits?.map((s) => (
      {
        'SugID': s['SugID'],
        'ItemID': s['ItemID']
      }))
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
