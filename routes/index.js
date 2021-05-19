var express = require('express');
var router = express.Router();
const Game = require('../schemas/gameSchema.js');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getGame', async function (req, res, next) {
  const data = await Game.findOne({});
  res.json(data);
});

router.post('/save', async function (req, res, next) {
  await Game.deleteOne({});
  let data = req.body.htmlGameState;

  const game = new Game({
    gameboard: data,
  });

  const saved = await game.save();

  res.json({ id: saved.id });
});

module.exports = router;
