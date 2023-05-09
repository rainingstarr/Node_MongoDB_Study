var router = require('express').Router();

router.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname + '/../' });
});
  
router.get('/write', function(req, res) {
    res.sendFile('write.html', { root: __dirname + '/../' });
});

module.exports = router;