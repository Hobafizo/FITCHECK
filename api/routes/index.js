var express = require('express');
var router = express.Router();

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
  res.download(req.query.file)
});

module.exports = router;
