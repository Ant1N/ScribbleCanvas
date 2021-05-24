const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const gameContainer = document.getElementById('game-container');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('getGameBtn');
const username = document.getElementById('username');

let color = ''; // will be updated with assigned color

// JOIN GAME, SEND USERNAME, PRINT GRID
document.addEventListener('click', (evt) => {
    switch (evt.target.id) {
        case 'joinChat':
            socket.emit('joinGame', username.value);
            removeModal();
            displayUser();
            break;
        case 'saveBtn':
            saveGame();
            break;
        case 'getGameBtn':
            // getGame();
            getGame();
            break;
        case 'savePicToDB':
            savePicToDB();
            break;
    }
});

//Modal function
function removeModal() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('modal').style.display = 'none';
}

//Display username function
function displayUser() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    usernameDisplay.innerHTML = username.value;
}

// Genereate the gamefield container and pixels 15x15
function createGrid() {
    let html = '<div class="gamefield" id="gamefield">';

    for (let i = 0; i < 225; i++) {
        html += `<div class="pixel" id="${i}" style="background-color:''";></div>`;
    }
    html += '</div>';

    // Where to insert the gamefield container
    // gameContainer.insertAdjacentHTML('afterbegin', html);
    gameContainer.innerHTML = html;
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
    // addColorOnPixel(data.color);
    // localStorage.setItem('playerColor', data.color);
    color = data.color;
});

// wher a player join the game
socket.on('waitForPlayers', (playerConnected) => {
    // if 4 players have joined the game, the start it for all players
    // else update how many players are connected x/4

    // document.getElementById('gamefield').style.backgroundImage = '';
    gameContainer.innerHTML = `<p class="playersconnected">Players connected ${playerConnected}/4</p>`;
    usernameDisplay.style.backgroundColor = '';
    saveBtn.hidden = true;
    loadBtn.hidden = true;
});

// Generate the grid for all players, see emit (after startGame)
socket.on('startGame', (background) => {
    createGrid();
    addColorOnPixel(color);
    usernameDisplay.style.backgroundColor = color;
    document.getElementById(
        'gamefield'
    ).style.backgroundImage = `url(${background})`;
    saveBtn.hidden = false;
    loadBtn.hidden = false;
    //localStorage.setItem("playerColor", data.color);
});

// Send the players color and clicked pixel-ID to server for broadcasting
function addColorOnPixel(color) {
    // Get your assigned color
    // let color = document.querySelector('.colorbox').id;

    // Add addEventListener on each pixel
    document.querySelectorAll('.pixel').forEach((pixel) => {
        pixel.addEventListener('click', (e) => {
            // If pixel doesn't have an inline background-color style
            // Then set color (so you can't change another players pixel)
            // console.log('clicking pixel');
            if (e.target.getAttribute('style') === "background-color:''") {
                // Set the pixel-color for the player
                e.target.setAttribute('style', `background-color:${color}`);

                // Save the pixel information in an object to send
                let pixelData = {
                    id: e.target.id,
                    color,
                };

                // Send the data to server for broadcast to the other players
                socket.emit('addColorOnTarget', pixelData);

                let sendPixelInfo = { id: e.target.id, color: color };

                socket.emit('toPicArray', sendPixelInfo);
            }
        });

        pixel.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (
                document.getElementById(e.target.id).style.backgroundColor ===
                color
            ) {
                e.target.setAttribute('style', `background-color:''`);
                // Save the pixel information in an object to send
                let pixelData = {
                    id: e.target.id,
                    color: "''",
                };

                // Send the data to server for broadcast to the other players
                socket.emit('addColorOnTarget', pixelData);

                let sendPixelInfo = { id: e.target.id, color: color };

                socket.emit('toPicArray', sendPixelInfo);
            }
        });
    });
}

// Add the color that other players clicked on
socket.on('addPixel', ({ id, color }) => {
    document
        .getElementById(id)
        .setAttribute('style', `background-color:${color}`);
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

function savePicToDB() {
<<<<<<< HEAD
  socket.emit("wantsPicArray", "click");

  socket.on("sendArrayToServer", (array) => {
    console.log("Denna ska skickas", array);

    fetch("http://localhost:3000/savePic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ array }),
    })
    .then(resp => resp.json())
    .then(answer => {
      console.log(answer);
    });
  });
};

function getGame() {
  const gameField = document.getElementById("gamefield");
  fetch("http://localhost:3000/getGame")
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data.gameboard);
      gameField.outerHTML = data.gameboard;
      addColorOnPixel(localStorage.getItem('playerColor'));
      // addColorOnPixel(localStorage.getItem('playerColor'));
    });
}

const pics = [
  { picId: 1, img: "../stylesheets/pictures/pizza.png" },
  { picId: 2, img: "../stylesheets/pictures/Mario.png" },
  { picId: 3, img: "../stylesheets/pictures/emoji.png" },
  { picId: 4, img: "../stylesheets/pictures/hjarta.png" },
  //{ picId: 1, img: 'images/' },
];

function getPic() {
  fetch("http://localhost:3000/getPic")
    .then((resp) => resp.json())
    .then((data) => {
      console.log("Id :", data.picId);
      console.log("Facit :", data.picture);
      //let backgroundGamePic = document.getElementById("game-container");
      for (pic in pics) {
        if (pics[pic].picId == data.picId) {
          //backgroundGamePic.style.backgroundImage = `url(${pics[pic].img})`;
          return `url(${pics[pic].img})`;
        }
      }
    });
}

const pics = [
  {picId: 1, img: "images/"},
  {picId: 2, img: "images/"},
  {picId: 3, img: "images/"},
  {picId: 4, img: "images/"},
  {picId: 1, img: "images/"},
];

function getPic() {
  fetch('http://localhost:3000/getPic')
  .then((resp) => resp.json())
  .then((data) => {
    console.log("Id :", data.picId);
    console.log("Facit :", data.picture);

    for (pic in pics) {
      if (pics[pic].picId == data.picId) {
        console.log("Printa bild");
        return;
      };
    };
  });
};
=======
    socket.emit('wantsPicArray', 'click');

    socket.on('sendArrayToServer', (array) => {
        console.log('Denna ska skickas', array);

        fetch('http://localhost:3000/savePic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ array }),
        })
            .then((resp) => resp.json())
            .then((answer) => {
                console.log(answer);
            });
    });
}

function getGame() {
    const gameContainer = document.getElementById('gamefield');
    fetch('http://localhost:3000/getGame')
        .then((resp) => resp.json())
        .then((data) => {
            gameContainer.outerHTML = data.gameboard;
            // addColorOnPixel(localStorage.getItem('playerColor'));
            addColorOnPixel(color);
            socket.emit('loadGame', data.gameboard);
        });
}

socket.on('loadGameboard', (gameboard) => {
    document.getElementById('gamefield').outerHTML = gameboard;
    addColorOnPixel(color);
});
>>>>>>> 00bc63f802eed46a483a0cc0c2985647cf62ce9e
