
/*
// Handle device orientation for camera control
window.addEventListener('deviceorientation', function(event) {
    const alpha = event.alpha ? THREE.Math.degToRad(event.alpha) : 0
    const beta = event.beta ? THREE.Math.degToRad(event.beta) : 0
    const gamma = event.gamma ? THREE.Math.degToRad(event.gamma) : 0

    camera.rotation.set(beta, gamma, alpha)
}, true)
*/
const canvas = document.getElementById('joystickCanvas')
const ctx = canvas.getContext('2d')

let mobile = true

function adjustCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

adjustCanvasSize()

let angle = 0

let mobileX
let mobileY

class Joystick {

  constructor(screenWidth, screenHeight) {
    this.r = Math.min(screenWidth, screenHeight) * 0.05; // Radius is 5% of the smaller screen dimension
    this.R = this.r * 2.5;

    this.x = screenWidth * 0.1; // X position is 10% of screen width
    this.y = screenHeight * 0.8; // Y position is 80% of screen height

    this.X = this.x;
    this.Y = this.y;

    this.dx = 0;
    this.dy = 0;
  }

  updateSizeAndPosition(screenWidth, screenHeight) {
    this.r = Math.min(screenWidth, screenHeight) * 0.05; // Recalculate radius
    this.R = this.r * 2.5;

    this.x = screenWidth * 0.1;
    this.y = screenHeight * 0.8;

    this.X = this.x;
    this.Y = this.y;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(this.X, this.Y, this.R, 0, Math.PI * 2);
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.restore();
  }

  updatePosition(clientX, clientY) {
    this.x = clientX;
    this.y = clientY;
    this.calculateDirection();
  }

  calculateDirection() {
    let dx = this.x - this.X;
    let dy = this.y - this.Y;

    // Normalize the direction
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > this.R) {
      dx = (dx / magnitude) * this.R;
      dy = (dy / magnitude) * this.R;
    }

    this.dx = dx / this.R; // Normalized x direction
    this.dy = dy / this.R; // Normalized y direction
  }

  reset() {
    this.x = this.X;
    this.y = this.Y;
    this.dx = 0;
    this.dy = 0;
  }
}



let joystick = new Joystick(canvas.width / 7, canvas.height / 1.3, 20)

joystick.updateSizeAndPosition(canvas.width, canvas.height)

function boundingCircle() {

  joystick.dx = 0
  joystick.dy = 0

  let ax = joystick.x - joystick.X
  let ay = joystick.y - joystick.Y

  let mag = Math.sqrt(ax**2 + ay**2)

  joystick.dx = ax / mag
  joystick.dy = ay / mag

  if(mag > joystick.R){

    joystick.x = joystick.X + (joystick.dx * joystick.R)
    joystick.y = joystick.Y + (joystick.dy * joystick.R)

  }
}

class MobileButtons {

  constructor(x, y, r){

    this.x = x
    this.y = y
    this.r = r
    this.pressed = false

  }

  draw() {

    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fillStyle = "red"
    ctx.fill()

  }


}

let mobileButtons = new MobileButtons(canvas.width / 1.12, canvas.height / 1.25, 50)

let touchEvent

let touchStarting = false

canvas.addEventListener('touchstart', (e) => {

  if(e.touches[0].clientX < screen.width / 2){

    touchStarting = true

    joystick.x = e.touches[0].clientX
    joystick.y = e.touches[0].clientY

    boundingCircle()
  }

  if(e.touches){
    if(e.touches[0]){
      if(e.touches[1]){
        if(e.touches[1].clientX < screen.width / 2){

          touchStarting = true

          joystick.x = e.touches[1].clientX
          joystick.y = e.touches[1].clientY

          boundingCircle()
        }
      }
    }
  }



  if(e.touches){
    if(e.touches[0]){
      if(e.touches[1]){
          mobileX = e.touches[1].clientX
          mobileY = e.touches[1].clientY
        }
      }
    }


  if(e.touches[0].clientX > screen.width / 2 ){

    mobileX = e.touches[0].clientX
    mobileY = e.touches[0].clientY

  }
})


canvas.addEventListener('touchmove', (e) => {

  if(e.changedTouches[0].clientX < screen.width / 2){

    joystick.x = e.changedTouches[0].clientX
    joystick.y = e.changedTouches[0].clientY

    boundingCircle()
  }
})

canvas.addEventListener('touchend', (e) => {

  if(e.changedTouches[0].clientX < screen.width / 2){

    touchStarting = false

    joystick.x = joystick.X
    joystick.y = joystick.Y
    joystick.dx = 0
    joystick.dy = 0

  }
})

canvas.oncontextmenu = function(e) {
  e.preventDefault()
  e.stopPropagation()
}

function drawJoystick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  joystick.draw(ctx)
  updateModelPosition()
  requestAnimationFrame(drawJoystick)
}

drawJoystick()

function updateModelPosition() {
  if(modelContainer){
    modelContainer.position.x += joystick.dx * 0.05;
    modelContainer.position.z -= joystick.dy * 0.05;
  }
}
