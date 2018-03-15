import "index.css"
import dat from "dat.gui";

const gui = new dat.GUI();
const body = document.body
const drawCtx = document.getElementById("drawing").getContext("2d");
const imgCtx = document.getElementById("image").getContext("2d");

const params = {
  steps: 20000,
  maxThick: 8.8,
  minThick: 0.8,
  wiggleAmp: 1.5,
  spiralRadius: drawCtx.canvas.width / 4,
  centerWidth: 0.5,
  wiggleDistance: 1.25
};

gui.add(params, "steps").onChange((newValue) => {
  params.steps = newValue
  redraw()
});

gui.add(params, "maxThick").onChange(newValue => {
  params.maxThick = newValue;
  redraw();
});

gui.add(params, "minThick").onChange(newValue => {
  params.minThick = newValue;
  redraw();
});

gui.add(params, "wiggleAmp").onChange(newValue => {
  params.wiggleAmp = newValue;
  redraw();
});

gui.add(params, "spiralRadius").onChange(newValue => {
  params.spiralRadius = newValue;
  redraw();
});

gui.add(params, "wiggleDistance").onChange(newValue => {
  params.wiggleDistance = newValue;
  redraw();
});

gui.add(params, "centerWidth").onChange(newValue => {
  params.centerWidth = newValue;
  redraw();
});

let lastImg;
let img;

const processImg = (img, ctx, params) => {

  let zip = (a1, a2, fn) => a1.map((val, i) => fn(val, a2[i]));

  let imgSize = [img.width, img.height];
  let canvasSize = [ctx.canvas.width, ctx.canvas.height];

  let sizes = zip(imgSize, canvasSize, Array.of); // array containing our image & canvas size

  // Map dimensions
  let scaleF = sizes.map(e => e[0] / e[1]).reduce((a, b) => Math.min(a, b));
  let scaledDims = imgSize.map(e => e / scaleF);
  let imgPos = zip(scaledDims, canvasSize, (a, b) => -(a - b) / 2);
  ctx.drawImage(img, 0, 0, ...imgSize, ...imgPos, ...scaledDims); // first we draw our image

  drawSpiral(drawCtx, imgCtx, params); // then, we draw our spiral based on this image
}

const drawSpiral = (drawCtx, imgCtx, params) => {
  let steps = params.steps;
  let maxThick = params.maxThick;
  let minThick = params.minThick;
  let wig = params.wiggleAmp;
  let centerWidth = params.centerWidth;  // center of the spiral width
  let wiggleDistance = params.wiggleDistance; // distance between two "wiggles"
  let centerx = drawCtx.canvas.width / 2;
  let centery = drawCtx.canvas.height / 2;
  
  // let's spiraaaaaal
  drawCtx.clearRect(0, 0, drawCtx.canvas.width, drawCtx.canvas.height);

  drawCtx.moveTo(centerx, centery);
  drawCtx.strokeStyle = "#000";
  let [lastx, lasty] = [centerx, centery];

  for (let i = 0; i < steps; i++) {
    let angle = params.spiralRadius / steps * i;
    let x = centerx + (centerWidth + wiggleDistance * angle) * Math.cos(angle) + Math.random() * wig;
    let y = centery + (centerWidth + wiggleDistance * angle) * Math.sin(angle) + Math.random() * wig;

    drawCtx.beginPath();
    drawCtx.moveTo(lastx, lasty);

    // copy pixel, black and whitify it, redraw it on our canvas, spiral
    let pxl = imgCtx.getImageData(x / 2, y / 2, 1, 1).data.slice(0, 3);
    let pxlB = 255 - pxl.reduce((centerWidth, wiggleDistance) => centerWidth + wiggleDistance) / 3;

    drawCtx.lineWidth = minThick + pxlB / (255 / (maxThick - minThick));
    drawCtx.lineTo(x, y);
    drawCtx.stroke();
    [lastx, lasty] = [x, y];
  }
};

const redraw = () => processImg(lastImg, imgCtx, params);

const preventDefault = event => {
  event.preventDefault();
};

const handleDrop = event => {
  event.preventDefault();
  let reader = new window.FileReader();
  reader.onload = event => {
    img = new Image();
    img.src = event.target.result;
    lastImg = img;
    img.onload = () => processImg(img, imgCtx, params);
  };
  let file = event.dataTransfer.files[0];
  reader.readAsDataURL(file);
};

window.addEventListener("drop", preventDefault)
window.addEventListener("dragover", preventDefault)
body.addEventListener("drop", handleDrop)