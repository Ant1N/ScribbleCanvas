var express = require('express');
var router = express.Router();
const Game = require('../schemas/gameSchema.js');
const Pic = require('../schemas/picSchema.js');


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
  console.log(data);

  const game = new Game({
    gameboard: data,
  });

  const saved = await game.save();
  res.json({ id: saved.id });
});

router.get('/getPic', async function (req, res, next) {
  let randomBetween1and5 = Math.floor(Math.random() * 4) + 1;

  const data = await Pic.findOne({picId: randomBetween1and5});
  res.json(data);
  console.log(data);
});

router.post('/getSolution', async function (req, res, next) {
  let picId = req.body;
  const data = await Pic.findOne({picId: picId.sendPicId});
  res.json(data.picture);
});

module.exports = router;
