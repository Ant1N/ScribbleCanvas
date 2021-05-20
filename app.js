var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const socketio = require('socket.io');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
const server = require('http').Server(app);
const io = socketio(server);

mongoose.connect( "mongodb+srv://limpanhur:gnaget123@cluster0.pvvp6.mongodb.net/ScribbleCanvas?retryWrites=true&w=majority", {

useNewUrlParser: true,

useCreateIndex: true,

useFindAndModify: false,

useUnifiedTopology: true,

},() => console.log("connected to db"));

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
const picArray = [];

io.on('connection', (socket) => {

    // GET USER AND ROOM FROM USERS.JS
    socket.on('joinGame', (username) => {
        // console.log('username', username);
        
        // PUSH USER TO USER-ARRAY
        const user = userJoin(socket.id, username);

        // WELCOME CURRENT USER
        // EMIT = SEND TO CURRENT USER
        socket.emit(
            'message',
            formatMessage(botName, 'Välkommen till chatten!')
        );

        // WHEN A USER CONNECT
        // BROADCAST = SEND TO ALL USERS
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

        // Send a players color and pixel to the other players
        socket.on('addColorOnTarget', ({ id, color }) => {
            socket.broadcast.emit('addPixel', { id, color });
        });

        // SEND ROOM AND USERS TO FRONTEND
        io.emit('roomUsers', {
            users: getRoomUsers()
        });
    });

    // LISTEN FOR CHAT MESSAGE
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        // SEND MESSAGE TO FRONTEND
        io.emit('message', formatMessage(user.username, msg));
    });

    // WHEN A USER DISCONNECT
    socket.on('disconnect', () => {
        // REMOVE USER FROM ARRAY
        const user = userLeave(socket.id);
        disconnectUser(socket.id);
        if (user) {
            io.emit(
                'message',
                formatMessage(botName, `${user.username} har lämnat chatten.`)
            );

            // SEND DISCONNECTED USER
            io.emit('roomUsers', {
                users: getRoomUsers()
            });
        }
    });

    socket.on('toPicArray', pushToPicArray => {
        picArray.push(pushToPicArray);
    })

    socket.on('wantsPicArray', msg => {
        socket.emit('sendArrayToServer', picArray);
    });
});

// Finds the players color on their socket id and removes the ID
function disconnectUser(id) {
    let coloruser = colors.find((color) => color.socketID === id);
    if (coloruser) {
        coloruser.socketID = '';
    }
}

module.exports = { app: app, server: server };
