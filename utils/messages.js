const moment = require('moment');

function formatMessage(userName, text) {
    return {
        userName,
        text,
        time: moment().format("DD-MM-YYYY hh:mm")
    }
}

module.exports = formatMessage;