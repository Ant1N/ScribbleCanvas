var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const socketio = require('socket.io');
const mongoose = require('mongoose');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const Pic = require('./schemas/picSchema.js');
var app = express();
const server = require('http').Server(app);
const io = socketio(server);

mongoose.connect(
    'mongodb+srv://limpanhur:gnaget123@cluster0.pvvp6.mongodb.net/ScribbleCanvas?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,

        useCreateIndex: true,

        useFindAndModify: false,

        useUnifiedTopology: true,
    },
    () => console.log('connected to db')
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Array of colors avaiable in the game
const colors = [
    {
        socketID: '',
        color: 'black',
        player: 'Player 1',
    },
    {
        socketID: '',
        color: 'red',
        player: 'Player 2',
    },
    {
        socketID: '',
        color: 'yellow',
        player: 'Player 3',
    },
    {
        socketID: '',
        color: 'green',
        player: 'Player 4',
    },
];

const formatMessage = require('./utils/messages.js');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require('./utils/users.js');

const botName = 'Chattroboten';
var picArray = [];

io.on('connection', (socket) => {
    // GET USER FROM USERS.JS
    socket.on('joinGame', (username) => {
        // console.log('username', username);

        // PUSH USER TO USER-ARRAY
        const user = userJoin(socket.id, username);

        // WELCOME CURRENT USER
        socket.emit(
            'message',
            formatMessage(botName, 'Välkommen till chatten!')
        );

        // WHEN A USER CONNECT
        socket.broadcast.emit(
            'message',
            formatMessage(
                botName,
                `${user.username} har anslutit till chatten!`
            )
        );

        // Get the first available color that hasn't a socket id assigned
        let color = colors.find((color) => color.socketID === '');

        // If the are no available colors then emit: maxplayers
        if (!color) return socket.emit('maxplayers');

        // Assing a players socket.id to the color and send it to the player
        color.socketID = socket.id;
        socket.emit('playerColor', color);

        // get the amount of colors taken and send it to the connected clients
        if (getAmountOfPlayers() === 4) {
            // socket.on('startGame', () => {
            //  let background = getBackground();
            // console.log('background', background);

            // io.emit('playersConnected', getAmountOfPlayers());
            io.emit('waitForPlayers', getAmountOfPlayers());
            io.emit('startGameClick');
            // });
        } else {
            io.emit('waitForPlayers', getAmountOfPlayers());
        }

        // Send a players color and pixel to the other players
        socket.on('addColorOnTarget', ({ id, color }) => {
            socket.broadcast.emit('addPixel', { id, color });
        });

        // SEND USERS TO FRONTEND
        io.emit('roomUsers', {
            users: getRoomUsers(),
        });
    });

    // LISTEN FOR CHAT MESSAGE
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // SEND MESSAGE TO FRONTEND
        io.emit('message', formatMessage(user.username, msg));
    });

    socket.on('loadGame', (gameboard) => {
        socket.broadcast.emit('loadGameboard', gameboard);
    });

    // WHEN A USER DISCONNECT
    socket.on('disconnect', () => {
        // REMOVE USER FROM ARRAY
        const user = userLeave(socket.id);
        disconnectUser(socket.id);
        io.emit('waitForPlayers', getAmountOfPlayers());

        if (user) {
            io.emit(
                'message',
                formatMessage(botName, `${user.username} har lämnat chatten.`)
            );

            // SEND DISCONNECTED USER
            io.emit('roomUsers', {
                users: getRoomUsers(),
            });
        }
    });

    // GET CLICKED DIV ID AND COLOR AND PUSH TO ARRAY
    socket.on('toPicArray', (pushToPicArray) => {
        picArray.push(pushToPicArray);
    });

    // SEND ARRAY TO FRONT
    socket.on('wantsPicArray', (msg) => {
        socket.emit('sendArrayToServer', picArray);
        
    });

    // WHEN CLICK ON START BTN
    socket.on('letsPlay', () => {
        startGame();
        io.emit('timerStartClient');
    });

    socket.on('paintMode', () => {
        io.emit('printPaintMode');
    });
});

// Finds the players color on their socket id and removes the ID
function disconnectUser(id) {
    let coloruser = colors.find((color) => color.socketID === id);
    if (coloruser) {
        coloruser.socketID = '';
    }
}

function getAmountOfPlayers() {
    // Get the amount of assigned colors (players)
    let playersConnected = colors.filter(
        (color) => color.socketID !== ''
    ).length;

    // send amount of players connected to all connected clients
    // return io.emit('playersConnected', playersConnected);
    return playersConnected;
}

async function startGame() {
    picArray = [];
    const backgrounds = [
        [{ picId: 1, url: '../stylesheets/pictures/pizza.png' }],
        [{ picId: 2, url: '../stylesheets/pictures/Mario.png' }],
        [{ picId: 3, url: '../stylesheets/pictures/emoji.png' }],
        [{ picId: 4, url: '../stylesheets/pictures/hjarta.png' }],
        [{ picId: 5, url: '../stylesheets/pictures/burger.png' }],
    ];

    // GET RANDOM NUMBER
    let randomBetween1and5 = Math.floor(Math.random() * 4);

    const randomBackground = backgrounds[randomBetween1and5][0];

    io.emit('startGame', randomBackground.url);

    io.emit('correctGame', randomBackground.picId);
}

module.exports = { app: app, server: server };
