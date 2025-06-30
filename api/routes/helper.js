var express = require('express')
var router = express.Router()

var sql = require('mssql/msnodesqlv8')
var dbOp = require('../sql/dbOperations')


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


async function GetUserOutfitSuggestions(user, session)
{
  var query = await dbOp.request()

  await query
      .input('UserID', sql.Int, user.UserID)
      .execute('[dbo].[GetOutfitSuggestions]', (err, result) =>
      {
        if (err != null)
        {
          console.log(err)
        }

        if (result == null || result.returnValue != 0 || result.recordsets == null || result.recordsets.length != 1)
        {
          return
        }

        var suggestions = result.recordsets[0]

        session.suggestions = suggestions
        session.save()
      })
}


async function GetUserOutfits(user, session)
{
  var query = await dbOp.request()

  await query
      .input('UserID', sql.Int, user.UserID)
      .execute('[dbo].[GetUserOutfits]', (err, result) =>
      {
        if (err != null)
        {
          console.log(err)
        }

        if (result == null || result.returnValue != 0 || result.recordsets == null || result.recordsets.length != 1)
        {
          return
        }

        var outfits = result.recordsets[0]

        session.outfits = outfits
        session.save()
      })
}


module.exports =
{
  GetUserWardrobe,
  GetUserOutfitSuggestions,
  GetUserOutfits
};
