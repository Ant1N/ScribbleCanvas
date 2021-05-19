var express = require('express');
var router = express.Router();
const Game = require('../schemas/gameSchema.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/save', async function(req, res, next) {
  let data = req.body;

  let sendData = JSON.stringify(data);

  const game = new Game({
    gameboard: sendData,
  });
    
  const saved = await game.save();
  res.json({ id: saved.id });
});

module.exports = router;
