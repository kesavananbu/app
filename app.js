const cssCode = `
#chatButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 20px;
  width: 150px;
}

#dragButton {
  cursor: move;
  font-size: 20px;
}

#chatBox {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: none;
  overflow: hidden;
}

#chatHeader {
  background-color: #007bff;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

#chatHeader h3 {
  margin: 0;
}

#closeButton {
  background-color: transparent;
  color: #fff;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

#chatContent {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
}

#chatInput {
  display: flex;
  align-items: center;
  overflow: auto;
}

#messageInput {
  flex-grow: 1;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

#sendButton {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 10px;
}

.chat-bubble {
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
}

.user-bubble {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

.response-bubble {
  background-color: #f1f0f0;
  color: black;
  align-self: flex-start;
}
`;




const scriptfirst = document.createElement('script');
scriptfirst.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
document.head.appendChild(scriptfirst);


const scriptsecond = document.createElement('script');
scriptsecond.src = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/6.0.1/signalr.js';
scriptsecond.onload = onSignalRScriptLoad;
document.head.appendChild(scriptsecond);


const chatButtonDiv = document.createElement("div");
chatButtonDiv.id="chatButton";

var chatButtonDivspan = document.createElement("span");
chatButtonDivspan.textContent = "Chat with us";

var chatButtonDivspandrag = document.createElement("span");
chatButtonDivspandrag.id = "dragButton";
chatButtonDivspandrag.innerHTML = "&#9776;";

chatButtonDiv.appendChild(chatButtonDivspan);
chatButtonDiv.appendChild(chatButtonDivspandrag);

const chatBoxDiv = document.createElement("div");
chatBoxDiv.id = "chatBox"

const chatHeaderDiv = document.createElement("div");
chatHeaderDiv.id = "chatHeader"

var chatHeaderDivh3 = document.createElement("h3");
chatHeaderDivh3.textContent = "Live Chat";

var chatHeaderDivclosebtn = document.createElement("button");
chatHeaderDivclosebtn.id = "closeButton";
chatHeaderDivclosebtn.textContent = "X";

chatHeaderDiv.appendChild(chatHeaderDivh3);
chatHeaderDiv.appendChild(chatHeaderDivclosebtn);

const chatContentDiv = document.createElement("div");
chatContentDiv.id = "chatContent";

const chatInputDiv = document.createElement("div");
chatInputDiv.id = "chatInput";

var chatInputDivtextInput = document.createElement("input");
chatInputDivtextInput.id = "messageInput"
chatInputDivtextInput.type = "text"
chatInputDivtextInput.placeholder = "Type your message..."

var chatInputDivsendbtn = document.createElement("button");
chatInputDivsendbtn.id = "sendButton";
chatInputDivsendbtn.textContent = "Send";

chatInputDiv.appendChild(chatInputDivtextInput)
chatInputDiv.appendChild(chatInputDivsendbtn)


chatBoxDiv.appendChild(chatHeaderDiv);
chatBoxDiv.appendChild(chatContentDiv);
chatBoxDiv.appendChild(chatInputDiv);

const chatContainerSection = document.getElementById("chatContainer");
chatContainerSection.appendChild(chatButtonDiv)
chatContainerSection.appendChild(chatBoxDiv)

const styleTag = document.createElement('style');
styleTag.innerHTML = cssCode;
document.head.appendChild(styleTag);

var connection = null;

const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const closeButton = document.getElementById("closeButton");
const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("messageInput");
const chatContent = document.getElementById("chatContent");
const dragButton = document.getElementById("dragButton");

let messages = [];

function renderMessages() {
  chatContent.innerHTML = "";
  messages.forEach((message) => {
    const div = document.createElement("div");
    div.innerHTML = message.text;
    div.classList.add("chat-bubble");

    // Check if the message sender is the current user
    if (message.sender === "web") {
      div.classList.add("user-bubble");
    } else {
      div.classList.add("response-bubble");
    }

    chatContent.appendChild(div);
  });
}

function addMessage(message) {
  messages.push(message);
  renderMessages();
}

function sendMessage() {
  const message = messageInput.value.trim();

  if (message) {
    const messageObj = {
      sender: "web",
      text: message,
    };

    sendSignalRMessage(messageObj.sender, messageObj.text);
    messages.push(messageObj);
    renderMessages();
    messageInput.value = "";
  }
}


chatButton.addEventListener("click", () => {
  chatBox.style.display = "block";
  chatButton.style.display = "none";
});

closeButton.addEventListener("click", () => {
  chatBox.style.display = "none";
  chatButton.style.display = "flex";
});

sendButton.addEventListener("click", () => {
  sendMessage();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    sendMessage();
  }
});


let isDragging = false;
let mouseOffsetX = 0;
let mouseOffsetY = 0;

dragButton.addEventListener("mousedown", (event) => {
  isDragging = true;
  mouseOffsetX = event.clientX - chatButton.offsetLeft;
  mouseOffsetY = event.clientY - chatButton.offsetTop;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    chatButton.style.left = event.clientX - mouseOffsetX + "px";
    chatButton.style.top = event.clientY - mouseOffsetY + "px";
  }
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    // If the user has moved the button, do nothing else
    isDragging = false;
  } else {
    // If the user has not moved the button, trigger the click event
    //chatButton.click();
  }
  event.stopPropagation();
});

function  onSignalRScriptLoad()
{
  connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5121/connect")
  .withAutomaticReconnect({
    nextRetryDelayInMilliseconds: retryContext => {
        if (retryContext.elapsedMilliseconds < 60000) {
            // If we've been reconnecting for less than 60 seconds so far,
            // wait between 0 and 10 seconds before the next reconnect attempt.
            return Math.random() * 10000;
        } else {
            // If we've been reconnecting for more than 60 seconds so far, stop reconnecting.
            return null;
        }
    }
})
  .configureLogging(signalR.LogLevel.Information)
  .build();

  connection.onreconnecting((error) => {
    connection.url = `http://localhost:5121/connect?user=${encodeURIComponent("web")}`;
  });

  connection.on("ReceiveMessage", (user, message) => {
    console.log(`${user}: ${message}`);
    // Handle received message here

    const messageObj = {
      sender: user,
      text: message,
    };

    if(user == "Server")
      messages.push(messageObj);
    renderMessages();

  });
  
  connection.start().then(() => {
    console.log("SignalR connection started.");
  }).catch((error) => {
    console.error(error);
  });
  
}


function sendSignalRMessage(user, message) {
  connection.invoke("SendMessage", user, message, connection.connectionId)
    .catch((error) => {
      console.error(error);
    });
}
