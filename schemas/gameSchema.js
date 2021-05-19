const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameboard: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
});
    
const Game = mongoose.model('Game', gameSchema);
    
module.exports = Game;