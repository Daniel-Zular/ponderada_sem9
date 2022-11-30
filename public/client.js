const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const socket = io();

// Estado do jogo
const gameState = {
  ball: {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 2,
    dy: -2,
    radius: 10,
  },
  paddle: {
    width: 10,
    height: 60,
    dy1: 0, // Inicialmente, o valor de dy1 será 0
    dy2: 0, // Inicialmente, o valor de dy2 será 0
  },
  players: {
    player1: {
      y: canvas.height / 2 - 30,
      score: 0,
    },
    player2: {
      y: canvas.height / 2 - 30,
      score: 0,
    },
  },
};

// Desenha o estado atual do jogo no canvas
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha a bola
  context.beginPath();
  context.arc(
    gameState.ball.x,
    gameState.ball.y,
    gameState.ball.radius,
    0,
    Math.PI * 2
  );
  context.fillStyle = "red";
  context.fill();
  context.closePath();

  // Desenha os jogadores
  context.fillStyle = "blue";
  context.fillRect(
    0,
    gameState.players.player1.y,
    gameState.paddle.width,
    gameState.paddle.height
  );

  context.fillStyle = "green";
  context.fillRect(
    canvas.width - gameState.paddle.width,
    gameState.players.player2.y,
    gameState.paddle.width,
    gameState.paddle.height
  );

  // Desenha as pontuações
  context.font = "20px Arial";
  context.fillText(`Player 1: ${gameState.players.player1.score}`, 10, 20);
  context.fillText(
    `Player 2: ${gameState.players.player2.score}`,
    canvas.width - 110,
    20
  );
}

// Movimenta os jogadores
function movePlayers() {
  const paddleSpeed = 5;

  document.addEventListener("keydown", (event) => {
    // Movimento do jogador 1 (teclas W e S)
    if (event.key === "w" || event.key === "W") {
      gameState.paddle.dy1 = -paddleSpeed;
    } else if (event.key === "s" || event.key === "S") {
      gameState.paddle.dy1 = paddleSpeed;
    }

    // Movimento do jogador 2 (setas para cima e para baixo)
    if (event.key === "ArrowUp") {
      gameState.paddle.dy2 = -paddleSpeed;
    } else if (event.key === "ArrowDown") {
      gameState.paddle.dy2 = paddleSpeed;
    }
  });

  document.addEventListener("keyup", (event) => {
    // Verifica se a tecla pressionada foi a tecla responsável pelo movimento atual do jogador 1
    if (
      (event.key === "w" || event.key === "W") &&
      gameState.paddle.dy1 === -paddleSpeed
    ) {
      gameState.paddle.dy1 = 0;
    } else if (
      (event.key === "s" || event.key === "S") &&
      gameState.paddle.dy1 === paddleSpeed
    ) {
      gameState.paddle.dy1 = 0;
    }

    // Verifica se a tecla pressionada foi a tecla responsável pelo movimento atual do jogador 2
    if (event.key === "ArrowUp" && gameState.paddle.dy2 === -paddleSpeed) {
      gameState.paddle.dy2 = 0;
    } else if (
      event.key === "ArrowDown" &&
      gameState.paddle.dy2 === paddleSpeed
    ) {
      gameState.paddle.dy2 = 0;
    }
  });

  socket.on("movePlayer1", (data) => {
    gameState.players.player1.y = data.y;
  });

  socket.on("movePlayer2", (data) => {
    gameState.players.player2.y = data.y;
  });
}

// Movimenta a bola e verifica colisões
function moveBall() {
  if (
    gameState.ball.y + gameState.ball.dy < gameState.ball.radius ||
    gameState.ball.y + gameState.ball.dy > canvas.height - gameState.ball.radius
  ) {
    gameState.ball.dy = -gameState.ball.dy;
  }

  if (
    gameState.ball.x + gameState.ball.dx < gameState.ball.radius ||
    gameState.ball.x + gameState.ball.dx > canvas.width - gameState.ball.radius
  ) {
    if (
      gameState.ball.y > gameState.players.player1.y &&
      gameState.ball.y <
        gameState.players.player1.y + gameState.paddle.height &&
      gameState.ball.dx < 0
    ) {
      gameState.ball.dx = -gameState.ball.dx;
    } else if (
      gameState.ball.y > gameState.players.player2.y &&
      gameState.ball.y <
        gameState.players.player2.y + gameState.paddle.height &&
      gameState.ball.dx > 0
    ) {
      gameState.ball.dx = -gameState.ball.dx;
    } else {
      if (gameState.ball.x + gameState.ball.dx < gameState.ball.radius) {
        gameState.players.player2.score++;
      } else {
        gameState.players.player1.score++;
      }

      gameState.ball.x = canvas.width / 2;
      gameState.ball.y = canvas.height / 2;
      gameState.ball.dx = -gameState.ball.dx;
      gameState.ball.dy = -gameState.ball.dy;
    }
  }

  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;
}

// Envia as atualizações de movimento dos jogadores para o servidor
function emitPlayerMovement() {
  setInterval(() => {
    const newY1 = Math.max(
      0,
      Math.min(
        canvas.height - gameState.paddle.height,
        gameState.players.player1.y + gameState.paddle.dy1
      )
    );
    if (newY1 !== gameState.players.player1.y) {
      gameState.players.player1.y = newY1;
      socket.emit("movePlayer1", { y: newY1 });
    }

    const newY2 = Math.max(
      0,
      Math.min(
        canvas.height - gameState.paddle.height,
        gameState.players.player2.y + gameState.paddle.dy2
      )
    );
    if (newY2 !== gameState.players.player2.y) {
      gameState.players.player2.y = newY2;
      socket.emit("movePlayer2", { y: newY2 });
    }
  }, 20);
}

// Loop do jogo
function gameLoop() {
  draw();
  moveBall();
  requestAnimationFrame(gameLoop);
}

// Inicia o jogo
function startGame() {
  movePlayers();
  emitPlayerMovement();
  gameLoop();
}

startGame();
