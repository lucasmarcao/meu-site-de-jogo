function poder() {
  var canvas = document.querySelector("canvas");
  var drawingSurface = canvas.getContext("2d");
  var sprites = [];
  var assetsToLoad = [];
  var missiles = [];
  var aliens = [];
  var messages = [];

  var background = Object.create(spriteObject);
  background.x = 0;
  background.y = 0;
  background.sourceY = 32;
  background.sourceWidth = 482;
  background.sourceHeight = 322;
  background.width = 487;
  background.height = 327;
  sprites.push(background);

  var cannon = Object.create(spriteObject);
  cannon.x = canvas.width / 2 - cannon.width / 2;
  cannon.y = 280;
  sprites.push(cannon);

  var scoreDisplay = Object.create(messageObject);
  scoreDisplay.font = "normal bold 45px Courier";
  scoreDisplay.fillStyle = "cyan";
  scoreDisplay.x = 420;
  scoreDisplay.y = 35;
  scoreDisplay.text = "0";
  messages.push(scoreDisplay);

  var gameOverMessage = Object.create(messageObject);
  gameOverMessage.fontStyle = "normal bold 20px alienArmada";
  gameOverMessage.fillStyle = "white";
  gameOverMessage.x = 48;
  gameOverMessage.y = 140;
  gameOverMessage.visible = false;
  messages.push(gameOverMessage);

  var image = new Image();
  image.addEventListener("load", loadHandler, false);
  image.src = "../images/testealienArmada2.png";
  assetsToLoad.push(image);

  var music = document.querySelector("#music");
  music.addEventListener("canplaythrough", loadHandler, false);
  music.load();
  music.play();
  assetsToLoad.push(music);

  var shootSound = document.querySelector("#shootSound");
  shootSound.addEventListener("canplaythrough", loadHandler, false);
  shootSound.load();
  assetsToLoad.push(shootSound);

  var explosionSound = document.querySelector("#explosionSound");
  explosionSound.addEventListener("canplaythrough", loadHandler, false);
  explosionSound.load();
  assetsToLoad.push(explosionSound);

  var assetsLoaded = 0;

  var LOADING = 0;
  var PLAYING = 1;
  var OVER = 2;
  var gameState = LOADING;

  var RECARREGA = 82;
  var PAUSE = 80;
  var RIGHT = 68;
  var LEFT = 65;
  var SPACE = 13;
  var NEWSPACE = 32;
  var moveRight = false;
  var moveLeft = false;
  var shoot = false;
  var spaceKeyIsDown = false;

  var alienFrequency = 100;
  var alienTimer = 0;

  var score = 0;
  var scoreNeededToWin = 60;
  

  window.addEventListener(
    "keydown",
    function (event) {
      switch (event.keyCode) {
        case RIGHT:
          moveRight = true;
          break;
        case RECARREGA:
          location.reload(true);
          break;
        case LEFT:
          moveLeft = true;
          break;

        case SPACE:
          if (!spaceKeyIsDown) {
            spaceKeyIsDown = true;
            shoot = true;
          }
          break;
        case NEWSPACE:
          if (!spaceKeyIsDown) {
            spaceKeyIsDown = true;
            shoot = true;
          }
          break;
        case PAUSE:
          gameState = LOADING;
          gameOverMessage.visible = true;
          gameOverMessage.x = 190;
          gameOverMessage.text = "PAUSADO!";
          gameOverMessage.fillStyle = "yellow";
          break;
      }
    },
    false
  );

  window.addEventListener(
    "keyup",
    function (event) {
      switch (event.keyCode) {
        case PAUSE:
          gameState = PLAYING;
          gameOverMessage.visible = false;
          break;
        case RIGHT:
          moveRight = false;
          break;

        case LEFT:
          moveLeft = false;
          break;

        case SPACE:
          spaceKeyIsDown = false;
          break;
        case NEWSPACE:
          spaceKeyIsDown = false;
          break;
      }
    },
    false
  );

  update();

  function update() {
    requestAnimationFrame(update, canvas);

    switch (gameState) {
      case PLAYING:
        playGame();
        break;

      case OVER:
        endGame();
        break;
      case LOADING:
        console.log("loading...");
    }

    render();
  }

  function loadHandler() {
    assetsLoaded++;
    if (assetsLoaded === assetsToLoad.length) {
      image.removeEventListener("load", loadHandler, false);
      music.removeEventListener("canplaythrough", loadHandler, false);
      shootSound.removeEventListener("canplaythrough", loadHandler, false);
      explosionSound.removeEventListener("canplaythrough", loadHandler, false);

      music.play();
      music.volume = 0.3;

      gameState = PLAYING;
    }
  }

  function playGame() {
    //left
    if (moveLeft && !moveRight) {
      cannon.dx = -8;
    }
    //right
    if (moveRight && !moveLeft) {
      cannon.dx = 8;
    }
    //no key pressed
    if (!moveLeft && !moveRight) {
      cannon.dx = 0;
    }

    if (shoot) {
      fireMissile();
      shoot = false;
    }

    //move the cannon
    cannon.x += cannon.dx;

    //Keep cannon within game boundaries
    if (cannon.x <= 0) {
      cannon.x = 0;
    }
    if (cannon.x + cannon.width >= canvas.width) {
      cannon.x = canvas.width - cannon.width;
    }

    for (var i = 0; i < missiles.length; i++) {
      var missile = missiles[i];

      missile.y += missile.dy;

      if (missile.y < 0 - missile.height) {
        removeObject(missile, missiles);

        removeObject(missile, sprites);

        i--;
      }
    }

    alienTimer++;

    if (alienTimer === alienFrequency) {
      makeAlien();
      alienTimer = 0;

      if (alienFrequency > 2) {
        alienFrequency--;
      }
    }

    for (var i = 0; i < aliens.length; i++) {
      var alien = aliens[i];

      if (alien.state === alien.NORMAL) {
        alien.y += alien.dy;
      }

      if (alien.y > canvas.height + alien.height) {
        gameState = OVER;
      }
    }

    for (var i = 0; i < aliens.length; i++) {
      var alien = aliens[i];

      for (var j = 0; j < missiles.length; j++) {
        if (hitTestRectangle(missile, alien) && alien.state === alien.NORMAL) {
          destroyAlien(alien);

          score++;
          scoreDisplay.text = score;

          if (score === scoreNeededToWin) {
            gameState = OVER;
          }

          removeObject(missile, missiles);
          removeObject(missile, sprites);

          j--;
        }
      }
    }
  }
  function destroyAlien(alien) {
    alien.state = alien.EXPLODED;
    alien.update();

    setTimeout(removeAlien, 1000);

    function removeAlien() {
      removeObject(alien, aliens);
      removeObject(alien, sprites);
    }

    explosionSound.currentTime = 0;
    explosionSound.play();
  }

  function makeAlien() {
    var alien = Object.create(alienObject);
    alien.sourceX = 32;

    alien.y = 0 - alien.height;

    var randomPosition = Math.floor(Math.random() * 15);
    alien.x = randomPosition * alien.width;

    alien.dy = 1;

    sprites.push(alien);
    aliens.push(alien);
  }

  function removeObject(objectToRemove, array) {
    var i = array.indexOf(objectToRemove);
    if (i !== -1) {
      array.splice(i, 1);
    }
  }

  function fireMissile() {
    var missile = Object.create(spriteObject);
    missile.sourceX = 96;
    missile.sourceWidth = 16;
    missile.sourceHeight = 16;
    missile.width = 16;
    missile.height = 16;

    missile.x = cannon.centerX() - missile.halfWidth();
    missile.y = cannon.y - missile.height;

    missile.dy = -8;

    sprites.push(missile);
    missiles.push(missile);

    shootSound.currentTime = 0;
    shootSound.play();
  }

  function endGame() {
    console.log("GAME OVER");
    gameOverMessage.visible = true;

    if (score < scoreNeededToWin) {
      gameOverMessage.text = "VOCE PERDEU !!!";
      gameOverMessage.x = 150;
      gameOverMessage.fillStyle = "red"
    } else {
      gameOverMessage.x = 150;
      gameOverMessage.text = "VOCE GANHOU !!!";
      gameOverMessage.fillStyle = "lime"
    }
  }
  
  function render() {
    drawingSurface.clearRect(0, 0, canvas.width, canvas.height);

    if (sprites.length !== 0) {
      for (var i = 0; i < sprites.length; i++) {
        var sprite = sprites[i];
        drawingSurface.drawImage(
          image,
          sprite.sourceX,
          sprite.sourceY,
          sprite.sourceWidth,
          sprite.sourceHeight,
          sprite.x,
          sprite.y,
          sprite.width,
          sprite.height
        );
      }
    }

    if (messages.length !== 0) {
      for (i = 0; i < messages.length; i++) {
        var message = messages[i];
        if (message.visible) {
          drawingSurface.font = message.font;
          drawingSurface.fillStyle = message.fillStyle;
          drawingSurface.textBaseLine = message.textBaseLine;
          drawingSurface.fillText(message.text, message.x, message.y);
        }
      }
    }
  }
};

function esquerda() {
  var canvas = document.querySelector("canvas");
  var drawingSurface = canvas.getContext("2d");
  var cannon = Object.create(spriteObject);
  cannon.x = canvas.width / 2 - cannon.width / 2;
  cannon.y = 280;
  
  var sprites = [];
  drawingSurface.clearRect(0, 0, canvas.width, canvas.height);
  sprites.push(cannon);
  document.body.style.backgroundColor = "aqua"
  moveRight = false;
  moveLeft = true;
  if (moveLeft && !moveRight) {
    cannon.dx = -8;
  }
  //right
  if (moveRight && !moveLeft) {
    cannon.dx = 8;
  }
  //no key pressed
  if (!moveLeft && !moveRight) {
    cannon.dx = 0;
  }
  cannon.x += cannon.dx;

    //Keep cannon within game boundaries
    if (cannon.x <= 0) {
      cannon.x = 0;
    }
    if (cannon.x + cannon.width >= canvas.width) {
      cannon.x = canvas.width - cannon.width;
    }
}
function centro() {
  document.body.style.backgroundColor = "pink"
}
function direita() {
  document.body.style.backgroundColor = "green"
}
function soltou() {
  document.body.style.backgroundColor = "darkgrey"
}

