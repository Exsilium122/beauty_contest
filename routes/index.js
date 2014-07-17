var express = require('express');
var router = express.Router();
var dto = require('../public/javascripts/app/dto.js');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/company', function(req, res) {
    var id = 1;
    res.json([
            new dto.Company(id++, "Juniper", "Sunnyvale", "+1 111 111 111"),
            new dto.Company(id++, "CISCO", "San José", "+2 222 222 222")
    ]);
});

module.exports = router;
