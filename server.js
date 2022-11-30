const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Configura o servidor estático
app.use(express.static("public"));

// Configura a conexão de um novo cliente
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Movimento dos jogadores
  socket.on("movePlayer1", (data) => {
    socket.broadcast.emit("movePlayer1", data);
  });

  socket.on("movePlayer2", (data) => {
    socket.broadcast.emit("movePlayer2", data);
  });

  // Trata a desconexão do cliente
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Inicia o servidor na porta 3000
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
