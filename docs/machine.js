var canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var convo = [];
var x;
var y;
var pixels = [];
var startX;
var startY;
var isDrawing = false;
var strokeCt = 0;
let d = false;
let usesTouch = false;

function update() {
  let str = '';
  let chat = document.getElementById('chat');
  str += '<ul>'
  for (let i=0; i<convo.length; i++)
  {
    if (d == true) {
      str += '<li>'+convo[i]+'&nbsp;&nbsp;<button type="button" onclick="del_i('+i+')">--</button></li>'
    }
    else {
      str += '<li>'+convo[i]+'</li>'
    }
  }
  str += '</ul>'
  chat.innerHTML = str;
  // console.log(convo);

}

function enter() {
  let val = document.getElementById('messagebox').value;
  document.getElementById('messagebox').value = '';
  convo.push(val);
  // console.log(convo);
  localStorage.setItem('convo', JSON.stringify(convo));

  update();
}


function del() {
  d = !d;
  let d_text = document.getElementById('del');
  if (d)
  {
    d_text.innerHTML = "Done"
  }
  else
  {
    d_text.innerHTML = "Del"
  }

  update();

}

function del_i(i) {
  convo.splice(i, 1);
  localStorage.setItem('convo', JSON.stringify(convo));
  update();
}

document.addEventListener('keydown', (event) => {
  if (event.key == 'Enter') {
    enter();
  }
}, false);

document.addEventListener('touchstart', e => {
  [...e.changedTouches].forEach(touch => {
    //e.preventDefault();
    const dot = document.createElement('div')
    dot.classList.add('dot')
    dot.style.top = `${touch.pageY}px`
    dot.style.left = `${touch.pageX}px`
    dot.id = touch.identifier
    document.body.append(dot)
    clientX = touch.clientX
    clientY = touch.clientY
  });
}, { passive: false })

document.addEventListener('touchmove', e => {
  // console.log(e);
  // console.log('Move');
  [...e.changedTouches].forEach(touch => {
    const dot = document.getElementById(touch.identifier)
    dot.style.top = `${touch.pageY}px`
    dot.style.left = `${touch.pageX}px`
    y = touch.pageY - canvas.offsetTop
    x = touch.pageX - canvas.offsetLeft
    console.log(`TouchMoves:  x: ${x}px, y: ${y}px`)   
//     deltaX = parseInt(touch.clientX - clientX);
//     deltaY = parseInt(touch.clientY - clientY);
   //console.log('myDeltaMoves '+deltaX+' '+ deltaY)
    
    
    usesTouch = true
  })
}, false)

document.addEventListener('touchend', e => {

  // Compute the change in X and Y coordinates.
  // The first touch point in the changedTouches
  // list is the touch point that was just removed from the surface.

  // Process the data…
  [...e.changedTouches].forEach(touch => {
    const dot = document.getElementById(touch.identifier)
    dot.remove()
    
    y = touch.pageY - canvas.offsetTop
    x = touch.pageX - canvas.offsetLeft
    console.log(`TouchEnds:  x: ${x}px, y: ${y}px`)  
    
//     deltaX = parseInt(touch.clientX - clientX);
//     deltaY = parseInt(touch.clientY - clientY);
    // console.log('myDeltaEnds '+deltaX+' '+ deltaY)
    usesTouch = false
  })
}, false);

document.addEventListener('touchcancel', e => {
  [...e.changedTouches].forEach(touch => {
    const dot = document.getElementById(touch.identifier)
    dot.remove()
    usesTouch = false

  })
})


function mouseMovement(e) {
  var rect = canvas.getBoundingClientRect();
  x = e.clientX - rect.left;
  y = e.clientY - rect.top;
}

function startDrawing() {
  startX = x;
  startY = y;
  isDrawing = true;
  strokeCt += 1;
  console.log('mousedown ct '+strokeCt);
}

function drawLine(startX, startY, x, y) {
  var obj = {
    startX: startX,
    startY: startY,
    x: x,
    y: y,
    strokeCt: strokeCt
  }
  pixels.push(obj);
}

function sketch() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (i=0; i<pixels.length; i++) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(pixels[i].startX, pixels[i].startY);
    ctx.lineTo(pixels[i].x, pixels[i].y);
    ctx.stroke();
  }

}

// keep track of the mouse pos
function stopDrawing() {
  isDrawing = false;
}

function undo() {
  console.log('Tbt');
  // Nothing has been drawn yet
  if (strokeCt < 1) {
    return;
  }
  for (var i=pixels.length-1; i>=0; i--) {
    // mousedown increments strokeCt
    // if == hasn't been incremented, it's the previous one
    if (pixels[i].strokeCt == strokeCt) {
      // undo delete the pixels
      pixels.splice(i, 1);
      console.log('stroke cts '+strokeCt);
    }
  }
  strokeCt -= 1;
  sketch();
}

function clear1() {
  pixels = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  console.log('clear func triggered')
}
// calling the clear() func
// binding the func with the button
// document.getElementById('clear').addEventListener('click', clear);


function load() {
  let storage = localStorage.getItem('convo');
  let storage1 = localStorage.getItem('pixels');

  if (storage != null || storage1 != null)
  {
    convo = JSON.parse(storage);
    pixels = JSON.parse(storage1);
  }
  update();
  // sketch();
}

load();


function frame() {
  if (isDrawing && (startX != x || startY != y)) {
    drawLine(startX, startY, x, y);
    sketch();
    startX = x;
    startY = y;
  }
}


setInterval(function (){
  frame()
}, 50);
