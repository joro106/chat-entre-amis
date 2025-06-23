const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let users = [];
let messages = {}; // { username1: { username2: [ {from, text} ] } }

io.on('connection', (socket) => {
  console.log('Un utilisateur connecté');

  socket.on('register', (username) => {
    socket.username = username;
    if (!users.includes(username)) {
      users.push(username);
    }
    io.emit('users', users);
  });

  socket.on('new-contact', (contact) => {
    if (!users.includes(contact)) {
      users.push(contact);
    }
    io.emit('users', users);
  });

  socket.on('message', ({ to, text }) => {
    if (!messages[socket.username]) messages[socket.username] = {};
    if (!messages[to]) messages[to] = {};
    if (!messages[socket.username][to]) messages[socket.username][to] = [];
    if (!messages[to][socket.username]) messages[to][socket.username] = [];

    const msg = { from: socket.username, text };
    messages[socket.username][to].push({ from: 'you', text });
    messages[to][socket.username].push(msg);

    io.to(to).emit('message', msg);
    socket.emit('message', { from: 'you', text });
  });

  socket.on('get-messages', (contact) => {
    const conv = messages[socket.username]?.[contact] || [];
    socket.emit('messages', conv);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.username} déconnecté`);
  });
});

http.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});