/**
 * @type {HTMLVideoElement}
 */
const videoRef = document.getElementById('localVideo')
/**
 * @type {HTMLButtonElement}
 */
const startButtonRef = document.getElementById('startButton')
/**
 * @type {HTMLButtonElement}
 */
const stopButtonRef = document.getElementById('stopButton')

/**
 * @type {MediaStream | null}
 */
let mediaStream = null
/**
 * @type {WebSocket | null}
 */
let ws = null

async function startCamera() {
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
  videoRef.srcObject = mediaStream
}

async function startStream() {
  if (!mediaStream) {
    return alert('카메라를 먼저 실행해주세요.')
  }
  startButtonRef.disabled = true
  stopButtonRef.disabled = false

  ws = new WebSocket(`ws://${window.location.host}`)
  ws.addEventListener('open', async () => {
    const recorder = new MediaRecorder(mediaStream, {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 1000000,
    })
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        ws.send(event.data);
      }
    }
    recorder.start(100)
  })
}

async function stopStream() {
  if (ws) {
    ws.close()
    ws = null
  }

  startButtonRef.disabled = false
  stopButtonRef.disabled = true
}

startButtonRef.addEventListener('click', startStream)
stopButtonRef.addEventListener('click', stopStream)
document.addEventListener('DOMContentLoaded', startCamera)
