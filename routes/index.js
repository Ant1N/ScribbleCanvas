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

  const game = new Game({
    gameboard: data,
  });

  const saved = await game.save();

  res.json({ id: saved.id });
});

router.post('/savePic', async function (req, res, next) {
  let data = req.body.array;
  console.log("Send to db", data);

  const pic = new Pic({
    picture: data,
  });

  const saved = await pic.save();
  res.json({ id: saved.id });
});

router.get('/getPic', async function (req, res, next) {
  let randomBetween1and5 = Math.floor(Math.random() * 4) + 1;

  const data = await Pic.findOne({picId: randomBetween1and5});
  res.json(data);
});

router.post('/getSolution', async function (req, res, next) {
  let picId = req.body;
  console.log("PicId:", picId.sendPicId);

  const data = await Pic.findOne({picId: picId.sendPicId});
  console.log(data);
  res.json(data.picture);
});

module.exports = router;
