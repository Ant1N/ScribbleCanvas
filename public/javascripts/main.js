const socket = io();

document.getElementById('chatPage').style.display= "none";

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// GET USERNAME AND ROOM FROM URL

document.getElementById('joinChat').addEventListener('click', () => {
    document.getElementById('chatPage').style.display= "block";
    document.getElementById('landingPage').style.display= "none";
    const username = document.getElementById('username').value;

    socket.emit('joinGame', username );
});

// GET ROOM AND USERS
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// GET MESSAGE FROM SERVER
socket.on('message', message => {
    outputMessage(message);

    // SCROLL DOWN
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// SUBMIT MESSAGE TO SERVER
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    // const msg = document.getElementById('msg').value;

    // SEND MESSAGE TO SERVER
    socket.emit('chatMessage', msg);

    // CLEAR INPUT
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();

});

// OUTPUT MESSAGE TO ALL USERS
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
};

// PRINT ROOMNAME
function outputRoomName(room) {
    roomName.innerText = room;
};

function outputUsers(users) {
    userList.innerHTML = "";

    for (user in users) {
        userList.insertAdjacentHTML('beforeend', `<li>${users[user].username}</li>
    `);
    };
};