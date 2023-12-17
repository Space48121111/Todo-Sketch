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
let to_delete = false;
let usesTouch = false;
let editing = false;


function insert() {
  let val = document.getElementById('messagebox').value;
  document.getElementById('messagebox').value = '';
  convo.push(val);
  console.log(convo);
  localStorage.setItem('convo', JSON.stringify(convo));

  update(convo);
}

document.addEventListener('keydown', (event) => {
  if (event.key == 'Enter') {
    insert();
  } 
}, false);

function edit() {
  // toggle editing
  editing = !editing;
  let editButton = document.getElementById('edit');
  let i = document.getElementById('memo');

  if (editing) {
    editButton.textContent = 'Done';
  } else {
    editButton.textContent = 'Edit';
  }
  
  update(convo);
}



function update(convo) {
  let str = '';
  let memo = document.getElementById('memo');
  str += '<ul>'
  for (let i=0; i<convo.length; i++) {
    if (editing == true) {
      str += '<li>'+convo[i]+'&nbsp;&nbsp;<button type="button" onclick="enableEditing('+i+')">--</button></li>'
    } else if (to_delete == true) {
      str += '<li>'+convo[i]+'&nbsp;&nbsp;<button type="button" onclick="enableDeleting('+i+')">--</button></li>'
    } else {
      str += '<li>'+convo[i]+'</li>'
    }
  }
  str += '</ul>'
  memo.innerHTML = str;
  console.log('update', convo);
}



function enableEditing(i) {
  let convo = JSON.parse(localStorage.getItem('convo'));
  let conversationDiv = document.getElementById('memo');

  console.log(convo[i])

  let inputField = document.createElement('input');
  inputField.type = 'text';
  inputField.value = convo[i];

  conversationDiv.parentNode.appendChild(inputField);
  
  let updateButton = document.createElement('button');
  updateButton.textContent = 'Update';
  conversationDiv.parentNode.appendChild(updateButton);

  updateButton.addEventListener('click', function() {
      convo[i] = inputField.value;
      localStorage.setItem('convo', JSON.stringify(convo));
      conversationDiv.textContent = convo[i];
      conversationDiv.parentNode.removeChild(inputField);
      conversationDiv.parentNode.removeChild(updateButton);
      console.log(convo)

      window.location.href = 'index.html';
    });
}


function del() {
  to_delete = !to_delete;
  let d_text = document.getElementById('del');
  if (to_delete) {
    d_text.innerHTML = "Done"
  } else {
    d_text.innerHTML = "Del"
  }

  update(convo);
}

function enableDeleting(i) {
  convo.splice(i, 1);
  localStorage.setItem('convo', JSON.stringify(convo));
  update(convo);
}



// touch
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

  [...e.changedTouches].forEach(touch => {
    const dot = document.getElementById(touch.identifier)
    dot.style.top = `${touch.pageY}px`
    dot.style.left = `${touch.pageX}px`
    y = touch.pageY - canvas.offsetTop
    x = touch.pageX - canvas.offsetLeft
    console.log(`TouchMoves:  x: ${x}px, y: ${y}px`)   

    usesTouch = true
  })
}, false)

document.addEventListener('touchend', e => {

  [...e.changedTouches].forEach(touch => {
    const dot = document.getElementById(touch.identifier)
    dot.remove()
    
    y = touch.pageY - canvas.offsetTop
    x = touch.pageX - canvas.offsetLeft
    console.log(`TouchEnds:  x: ${x}px, y: ${y}px`)  

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

// drawing
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

function stopDrawing() {
  isDrawing = false;
}

function undo() {
  console.log('Tbt');
  if (strokeCt < 1) {
    return;
  }
  for (var i=pixels.length-1; i>=0; i--) {

    if (pixels[i].strokeCt == strokeCt) {
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


function load() {
  let storage = localStorage.getItem('convo');
  let storage1 = localStorage.getItem('pixels');

  if (storage != null)
  {
    convo = JSON.parse(storage);   
    update(convo);
  }

  
  if (storage1 != null)
  {
    pixels = JSON.parse(storage1);
    
  }
  else 
  {
    sketch();
  }

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
