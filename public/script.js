const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
myVideo.className = 'my-video'

const peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
}).then((stream) => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)

  peer.on('call', call =>{
    call.answer(stream)
    const video= document.createElement('video')
    call.on('stream', userVideoStream=>{
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId)=>{
    connectToNewUser(userId, stream);
  })
});

peer.on('open', id =>{
  socket.emit('join-room', ROOM_ID, id)
})


function connectToNewUser(userId, stream){
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
};

function addVideoStream (video, stream){
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};


//Messaging section of App

let msg = document.getElementById('chat_message')
msg.onkeypress = sendMessage

let chatWindow = document.querySelector('.messages')

function sendMessage(e){
  if (e.which == 13 && msg.value.length !== 0) {
    socket.emit('message', msg.value);
    msg.value= ''
  }

}

socket.on("createMessage", message => {
  console.log('in here', message)
  chatWindow.insertAdjacentHTML( "beforeend",`<li class="message"><b>user</b><br/>${message}</li>`);
  // scrollToBottom()
})
