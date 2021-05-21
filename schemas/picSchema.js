const mongoose = require('mongoose');

const picSchema = new mongoose.Schema({
    picture: {
        type: Array,
        required: true,
        minlength: 2,
        trim: true,
    },
});
    
const Pic = mongoose.model('Pic', picSchema);
    
module.exports = Pic;