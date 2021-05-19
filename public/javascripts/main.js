const socket = io();

document.getElementById('content').style.display = 'none';

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const gameContainer = document.getElementById('game-container');

// JOIN GAME, SEND USERNAME, PRINT GRID
document.addEventListener('click', (evt) => {
  switch (evt.target.id) {
    case 'joinChat':
      document.getElementById('content').style.display = 'flex';
      document.getElementById('landingPage').style.display = 'none';

      const username = document.getElementById('username').value;
      socket.emit('joinGame', username);
      createGrid();
      createBtns();
    break;
    case 'saveBtn':
      saveGame();
    break;
    case 'getGameBtn':
      getGame();
    break;
  };
});

// Genereate the gamefield container and pixels 15x15
function createGrid() {
  let html = '<div class="gamefield" id="gamefield">';

  for (let i = 0; i < 225; i++) {
    html += `<div class="pixel" id="${i}"></div>`;
  }
  html += '</div>';

  // Where to insert the gamefield container
  gameContainer.insertAdjacentHTML('afterbegin', html);
}

// CREATE BTNS
function createBtns() {
  document.getElementById('btnsContainer').innerHTML = `<button id="saveBtn">Spara</button>
  <button id="getGameBtn">Hämta</button>`
};

// GET ROOM AND USERS AND PRINT IN CHAT
socket.on('roomUsers', ({ users }) => {
  outputUsers(users);
});

// GET MESSAGE FROM SERVER AND PRINT IT
socket.on('message', (message) => {
  outputMessage(message);

  // SCROLL DOWN
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('playerColor', (data) => {
  addColorOnPixel(data.color);
  localStorage.setItem("playerColor", data.color);
  // console.log(data);
});

// Send the players color and clicked pixel-ID to server for broadcasting
function addColorOnPixel(color) {
  // console.log('color:', color);
  // Get your assigned color
  // let color = document.querySelector('.colorbox').id;

  // Add addEventListener on each pixel
  document.querySelectorAll('.pixel').forEach((pixel) => {
    pixel.addEventListener('click', (e) => {
      // If pixel doesn't have an inline background-color style
      // Then set color (so you can't change another players pixel)
      // console.log('clicking pixel');
      if (!e.target.getAttribute('style')) {
        // Set the pixel-color for the player
        e.target.setAttribute('style', `background-color: ${color}`);

        // Save the pixel information in an object to send
        let pixelData = {
          id: e.target.id,
          color,
        };

        // Send the data to server for broadcast to the other players
        socket.emit('addColorOnTarget', pixelData);
      }
    });
  });
}

// Add the color that other players clicked on
socket.on('addPixel', ({ id, color }) => {
  document
    .getElementById(id)
    .setAttribute('style', `background-color: ${color}`);
});

// SUBMIT MESSAGE TO SERVER
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // SEND MESSAGE TO SERVER
  socket.emit('chatMessage', msg);

  // CLEAR INPUT
  e.target.elements.msg.value = '';
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
}

function outputUsers(users) {
  userList.innerHTML = '';

  for (user in users) {
    userList.insertAdjacentHTML(
      'beforeend',
      `<li>${users[user].username}</li>`
    );
  }
}



async function saveGame() {
  const htmlGameState = document.getElementById('gamefield').outerHTML;
  // console.log(htmlGameState);
  const response = await fetch('http://localhost:3000/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ htmlGameState }),
  });
  const result = await response.json();
  console.log(result);
}

function getGame() {
  const gameField = document.getElementById('gamefield');
  fetch('http://localhost:3000/getGame')
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data.gameboard);
      gameField.outerHTML = data.gameboard;
      addColorOnPixel(localStorage.getItem("playerColor"));
    });
}
