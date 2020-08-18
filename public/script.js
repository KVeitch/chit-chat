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
  audio: true
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


const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  })
};

const addVideoStream = (video, stream) => {
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
  chatWindow.insertAdjacentHTML( "beforeend",`<li class="message"><b>Name</b> : ${message}</li>`);
  scrollToBottomOfChat()
})

const scrollToBottomOfChat = () => {
  let chatWindow = document.getElementById('main__chat_window')
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const toggleMute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    toggleMuteBtn(enabled)
  } else {
    toggleMuteBtn(enabled)
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const toggleMuteBtn = (isMuted) => {
  let html = isMuted ?
  `<i class="unmute fas fa-microphone-slash"></i><span>Unmute</span>`:
  `<i class="fas fa-microphone"></i><span>Mute</span>`;
  document.querySelector('.main__mute_button').innerHTML = html;
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    togglePlayVideoBtn(enabled)
    // setPlayVideo()
  } else {
    // setStopVideo()
    togglePlayVideoBtn(enabled)
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const togglePlayVideoBtn = (isEnabled) => {
  let html = isEnabled?`<i class="stop fas fa-video-slash"></i><span>Play Video</span>`:
  `<i class="fas fa-video"></i><span>Stop Video</span>`;
  document.querySelector('.main__video_button').innerHTML = html
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}