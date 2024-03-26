// const socket = io("wss://53ba-2400-1a00-b050-9b68-84d4-6611-d991-7e4b.ngrok-free.app/");
const socket = io("wss://localhost:3000");

const clientsTotal = document.getElementById("client-total");

const messageContainer = document.getElementById("message-container");
const nameInput = document.getElementById("name-input");
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const setUsername = document.getElementById('set-username');
const connectUsersElement = document.getElementById('connected-users');
const email = document.getElementById('email');

setUsername.onclick = () => {
  document.getElementById('user-form').style.display = 'none';
  document.getElementById('users-container').style.display = 'unset';
  const username = document.getElementById('username').value;
  document.getElementById('my-username').innerHTML = 'My name is: ' + username;
  socket.emit('set-username', {
    username: username,
    email: email.value
  });
};

function addUserToUserList(user) {
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(user.username));
  li.userEmail = user.email;
  li.onclick = function() {
    // document.getElementById('connected-users').style.display = 'none';
    // document.getElementById('message-container').style.display = 'unset';
    console.log('Now chatting with ', li.textContent, li.userEmail);
  }
  connectUsersElement.appendChild(li);
}

socket.on('new-user-connected', ((data) => {
  addUserToUserList(data);
}));

socket.on('update-user-list', (usersConnected) => {
  connectUsersElement.innerHTML = ''      
  for (let i = 0; i < usersConnected.length; i++) {
    const user = usersConnected[i];
    if (user.email !== email.value)
        addUserToUserList(user);
  }
});

//const messageTone = new Audio("/message-tone.mp3");


function initiatePrivateChat(source, target, id) {
  console.log("Initiating private chat with user:" + source + " and " + target);
  const sortedRoom = [source, target].sort();
  const room = `room${sortedRoom[0]}${sortedRoom[1]}`;
  console.log("Created room", room);
  chatTo = id;
  socket.emit("join-room", room);
}
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

var rooms = [];

socket.on("private-chat-initiated", (room) => {
  socket.on(room, function (message) {
    // Handle incoming messages in the private chat room
    console.log("Received message in private chat: ", message);
  });

  // alert("Joined at room", room);    
  // socket.join(room);
});

socket.on("clients-total", (data) => {
  console.log("data", data);
  clientsTotal.innerText = `Total Clients: ${data}`;
});

function sendMessage() {
  console.log("messageinput", messageInput.value);
  if (messageInput.value === "") return;
  // console.log(messageInput.value)
  const data = {
    // name: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
    id: chatTo,
  };
  socket.emit("private-chat", data);
  addMessageToUI(true, data);
  messageInput.value = "";
}

socket.on("chat-message", (data) => {
  // console.log(data)
  messageTone.play();
  addMessageToUI(false, data);
});

function addMessageToUI(isOwnMessage, data) {
  clearFeedback();
  const element = `
      <li class="${isOwnMessage ? "message-right" : "message-left"}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
        </li>
        `;

  messageContainer.innerHTML += element;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// messageInput.addEventListener("focus", (e) => {
//   console.log("value", nameInput);
//   socket.emit("feedback", {
//     feedback: `✍️ ${nameInput.value} is typing a message`,
//   });
// });

// messageInput.addEventListener("keypress", (e) => {
//   socket.emit("feedback", {
//     feedback: `✍️ ${nameInput.value} is typing a message`,
//   });
// });
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback", {
    feedback: "",
  });
});

socket.on("feedback", (data) => {
  clearFeedback();
  const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `;
  messageContainer.innerHTML += element;
});

function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((element) => {
    element.parentNode.removeChild(element);
  });
}