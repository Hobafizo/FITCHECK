var express = require('express');
var router = express.Router();
const fs = require('fs');
var path = require('path');

const {
  check,
  body,
  // ...
  validationResult,
  checkSchema,
} = require("express-validator");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/asset', function(req, res, next) {
  const appDir = path.dirname(require.main.filename).replace('api\\bin', 'api')
  const filePath = appDir + '\\' + req.query.file

  fs.stat(filePath, function(err, stat)
  {
    if (err == null)
      res.sendFile(filePath)
    else
      res.send('asset not found');
  });
});

module.exports = router;
