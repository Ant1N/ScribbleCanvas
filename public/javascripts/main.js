const socket = io();

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const userList = document.getElementById("users");
const gameContainer = document.getElementById("game-container");
const saveBtn = document.getElementById("saveBtn");
const startBtn = document.getElementById("startBtn");
const loadBtn = document.getElementById("getGameBtn");
const username = document.getElementById("username");
const resultContainer = document.getElementById("resultContainer");

let color = ""; // will be updated with assigned color

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
            getGame();
            break;
        case 'startBtn':
            socket.emit('letsPlay');
            socket.emit("timerStart");
            break;
        case 'paintBtn':
          socket.emit('paintMode');
        break;
    };
});

socket.on('printPaintMode', () => {
  paintMode();
});

function paintMode() {
  createGrid();
  addColorOnPixel(color);
  usernameDisplay.style.backgroundColor = color;
  saveBtn.hidden = false;
  loadBtn.hidden = false;
};

function startTimer() {
  let incomeTicker = 20;

  timer = setInterval(function () {
    if (incomeTicker > 0) {
      incomeTicker--;
      document.getElementById("timer").innerHTML = incomeTicker;
    } else {
      stopTimer();
      correctGame();
    };
  }, 1000);

};

function stopTimer() {
  clearInterval(timer);
  document.getElementById("timer").innerHTML = "";
};

//Modal function
function removeModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
}

//Display username function
function displayUser() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    usernameDisplay.innerHTML = username.value;
};

// Genereate the gamefield container and pixels 15x15
function createGrid() {
  let html = '<div class="gamefield" id="gamefield">';

    for (let i = 0; i < 225; i++) {
        html += `<div class="pixel" id="${i}"></div>`;
    }
    html += '</div>';

    // Where to insert the gamefield container
    gameContainer.innerHTML = html;
}

// GET USERS AND PRINT IN CHAT
socket.on("roomUsers", ({ users }) => {
  outputUsers(users);
});

socket.on("timerStartClient", (msg) => {
  startTimer();
});

// GET MESSAGE FROM SERVER AND PRINT IT
socket.on("message", (message) => {
  outputMessage(message);

  // SCROLL DOWN
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('playerColor', (data) => {
    color = data.color;
});

// wher a player join the game
socket.on('waitForPlayers', (playerConnected) => {
    // if 4 players have joined the game, the start it for all players
    // else update how many players are connected x/4

    gameContainer.innerHTML = `<p class="playersconnected">Players connected ${playerConnected}/4</p>`;
    usernameDisplay.style.backgroundColor = '';
    saveBtn.hidden = true;
    loadBtn.hidden = true;
    startBtn.hidden = true;
    getGameBtn.hidden = true;
    paintBtn.hidden = true;
});

// Generate the grid for all players, see emit (after startGame)
socket.on('startGameClick', () => {
    startBtn.hidden = false;
    paintBtn.hidden = false;
});

  socket.on("startGame", (background) => {
    createGrid();
    addColorOnPixel(color);
    saveBtn.hidden = true;
    loadBtn.hidden = true;
    startBtn.hidden = true;
    paintBtn.hidden = true;
    usernameDisplay.style.backgroundColor = color;
    document.getElementById(
      "gamefield"
    ).style.backgroundImage = `url(${background})`;
    resultContainer.innerHTML = "";
});

  // Send the players color and clicked pixel-ID to server for broadcasting
  function addColorOnPixel(color) {
    // Get your assigned color

    // Add addEventListener on each pixel
    document.querySelectorAll('.pixel').forEach((pixel) => {
        pixel.addEventListener('click', (e) => {
            // If pixel doesn't have an inline background-color style
            // Then set color (so you can't change another players pixel)
            if (!e.target.getAttribute('style')) {
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
            };
        });
    });
};

// Add the color that other players clicked on
socket.on("addPixel", ({ id, color }) => {
  document
    .getElementById(id)
    .setAttribute("style", `background-color:${color}`);
});


socket.on('maxplayers', () => {
  document.body.innerHTML = `
   <h1>Pixel Painter!</h1>
  <h2>Spelet är fullt! Test igen senare</h2>
   `
})

// SUBMIT MESSAGE TO SERVER
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // SEND MESSAGE TO SERVER
  socket.emit("chatMessage", msg);

  // CLEAR INPUT
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// OUTPUT MESSAGE TO ALL USERS
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `
    <p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

function outputUsers(users) {
  userList.innerHTML = "";

  for (user in users) {
    userList.insertAdjacentHTML(
      "beforeend",
      `<li>${users[user].username}</li>`
    );
  }
}

async function saveGame() {
    const htmlGameState = document.getElementById('gamefield').outerHTML;
    console.log(htmlGameState);
    const response = await fetch('http://localhost:3000/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ htmlGameState }),
    });
    const result = await response.json();
    console.log(result);
};

let currentPicId;

socket.on("correctGame", (picId) => {
  currentPicId = picId;
});

function correctGame() {
    socket.emit('wantsPicArray');

    let sendPicId = currentPicId;
    let correctAnswers = 0;

    socket.on('sendArrayToServer', (array) => {
        console.log('Det här är våra klick', array);

        fetch('http://localhost:3000/getSolution', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sendPicId })
        })
            .then((resp) => resp.json())
            .then((answer) => {
                console.log('Solution: ', answer);

                for (let i = 0; i < answer.length; i++) {
                    for (let j = 0; j < array.length; j++) {
                        if (
                            array[j].id == answer[i].id &&
                            array[j].color == answer[i].color
                        ) {
                            console.log("correct with "+  array[j].id, answer[i].id, array[j].color, answer[i].color);
                            correctAnswers++;
                        }
                    }
                }

                let correctAnswerPercent = (correctAnswers / answer.length) * 100;
                let corAnsPer = correctAnswerPercent.toFixed(2);
                console.log(correctAnswers);
                console.log(corAnsPer + '%');
                resultContainer.innerHTML = "";
                resultContainer.innerHTML = `<div class="result-container"><p>Ert resultat:</p> <p class="correct-percent">${corAnsPer}% korrekt.</p></div>`
                startBtn.hidden = false;
                paintBtn.hidden = false;

                socket.off('sendArrayToServer');
            });
    });
};

function getGame() {
    const gameContainer = document.getElementById('gamefield');
    fetch('http://localhost:3000/getGame')
        .then((resp) => resp.json())
        .then((data) => {
            gameContainer.outerHTML = data.gameboard;
            addColorOnPixel(color);
            socket.emit('loadGame', data.gameboard);
        });
};

socket.on('loadGameboard', (gameboard) => {
    document.getElementById('gamefield').outerHTML = gameboard;
    addColorOnPixel(color);
});
