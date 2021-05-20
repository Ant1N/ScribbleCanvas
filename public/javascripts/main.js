const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const gameContainer = document.getElementById('game-container');

createGrid();

function removeModal() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('modal').style.display = 'none';
}

// JOIN GAME, SEND USERNAME, PRINT GRID
document.addEventListener('click', (evt) => {
  switch (evt.target.id) {
    case 'joinChat':
      const username = document.getElementById('username').value;
      socket.emit('joinGame', username);
      removeModal();
      break;
    case 'saveBtn':
      saveGame();
      break;
    case 'getGameBtn':
      getGame();
      break;
    case 'savePicToDB':
      savePicToDB();
    break;
  }
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
        
        let sendPixelInfo = {id: e.target.id, color: color};

        socket.emit('toPicArray', sendPixelInfo);
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



// socket.on('sendArrayToServer', (array) => {
  
//   document.getElementById('savePicToDB').addEventListener('click', () => {
//     console.log("Här", array);
    
//   });
// });

function savePicToDB() {
  socket.emit('wantsPicArray', "click");

  socket.on('sendArrayToServer', array => {
    console.log("Denna ska skickas", array);

    fetch('http://localhost:3000/savePic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ array })
    });
  });
};

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
