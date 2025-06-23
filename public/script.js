const socket = io();
let currentUser = '';
let currentContact = '';

function register() {
  const name = document.getElementById('username').value.trim();
  if (!name) return;
  currentUser = name;
  socket.emit('register', name);
  document.querySelector('.login').classList.add('hidden');
  document.querySelector('.chat-app').classList.remove('hidden');
}

function addContact() {
  const contact = document.getElementById('newContact').value.trim();
  if (!contact) return;
  socket.emit('new-contact', contact);
  document.getElementById('newContact').value = '';
}

socket.on('users', (users) => {
  const ul = document.getElementById('userList');
  ul.innerHTML = '';
  users.filter(u => u !== currentUser).forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    li.onclick = () => selectContact(user);
    ul.appendChild(li);
  });
});

function selectContact(user) {
  currentContact = user;
  document.getElementById('currentChat').textContent = 'Discussion avec ' + user;
  document.getElementById('messages').innerHTML = '';
  socket.emit('get-messages', user);
}

function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  if (!text || !currentContact) return;
  socket.emit('message', { to: currentContact, text });
  input.value = '';
}

socket.on('messages', (msgs) => {
  const msgBox = document.getElementById('messages');
  msgBox.innerHTML = '';
  msgs.forEach(msg => displayMessage(msg));
});

socket.on('message', (msg) => {
  displayMessage(msg);
});

function displayMessage(msg) {
  const div = document.createElement('div');
  div.className = 'msg ' + (msg.from === 'you' ? 'from-you' : 'from-them');
  div.textContent = msg.text;
  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}