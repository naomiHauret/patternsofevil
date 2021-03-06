import "index.css";
import dat from "dat.gui";
import C2S from "canvas2svg";

const gui = new dat.GUI();
const body = document.body;
const spiralCanvas = document.getElementById("spiral");
const spiralCtx = spiralCanvas.getContext("2d");
const imgCtx = document.getElementById("image").getContext("2d");
const downloadButton = document.querySelector("#downloadSvgCode");
let svgExportCtx;

const params = {
  steps: 35000,
  maxThick: 9.5,
  minThick: 0.8,
  wiggleWaviness: 0,
  spiralRadius: 470,
  centerWidth: 0,
  wiggleDistance: 1.2,
  backgroundColor: "#ffffff",
  drawingColor: "#000",
  isFilled: true,
};

spiralCanvas.style.backgroundColor = params.backgroundColor;

// Dat.gui params
gui.add(params, "steps").onChange((newValue) => {
  params.steps = newValue;
  redraw();
});

gui.add(params, "maxThick").onChange(newValue => {
  params.maxThick = newValue;
  redraw();
});

gui.add(params, "minThick").onChange(newValue => {
  params.minThick = newValue;
  redraw();
});

gui.add(params, "wiggleWaviness").onChange(newValue => {
  params.wiggleWaviness = newValue;
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

gui.addColor(params, "backgroundColor").onChange(newValue => {
  params.backgroundColor = newValue;
  spiralCanvas.style.backgroundColor = params.backgroundColor;
});

gui.addColor(params, "drawingColor").onChange(newValue => {
  params.drawingColor = newValue;
  spiralCtx.fillStyle = params.drawingColor;
  spiralCtx.strokeStyle = params.drawingColor;
  redraw();
});

gui.add(params, "isFilled").onChange(newValue => {
   params.isFilled = newValue;
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
  let scaledDims = imgSize.map(e => e / scaleF); // resize image so it fits in our canvas
  let imgPos = zip(scaledDims, canvasSize, (a, b) => -(a - b) / 2);  // center our image in the middle of our canvas
  ctx.drawImage(img, 0, 0, ...imgSize, ...imgPos, ...scaledDims); // first we draw our image to its canvas

  drawSpiral(spiralCtx, imgCtx, params); // then, we draw our spiral based on this image
}

const drawSpiral = (spiralCtx, imgCtx, params) => {
  // Initialize and the parameters of the drawn spiral to dat.gui
  let steps = params.steps;
  let maxThick = params.maxThick;
  let minThick = params.minThick;
  let wig = params.wiggleWaviness;
  let centerWidth = params.centerWidth;  // size of the "void" at the beggining of the spiral
  let wiggleDistance = params.wiggleDistance; // distance between two "wiggles"
  let centerx = spiralCtx.canvas.width / 2;
  let centery = spiralCtx.canvas.height / 2;

  svgExportCtx = new C2S(spiralCtx.canvas.width, spiralCtx.canvas.height); // for our SVG export

  // let's spiraaaaaal
  spiralCtx.clearRect(0, 0, spiralCtx.canvas.width, spiralCtx.canvas.height); // wipe out canvas
  svgExportCtx.clearRect(0, 0, spiralCtx.canvas.width, spiralCtx.canvas.height);

  for (let i = 0; i < steps; i++) {
    let angle = params.spiralRadius / steps * i;
    let x = centerx + (centerWidth + wiggleDistance * angle) * Math.cos(angle) + Math.random() * wig; // x position of the area we're going to redraw
    let y = centery + (centerWidth + wiggleDistance * angle) * Math.sin(angle) + Math.random() * wig; // y position of the area we're going to redraw

    let pxl = imgCtx.getImageData(x/2, y/2, 1, 1).data.slice(0, 3); // get RGB value of of a pixel at position x/2, y/2
    let pxlB = 255 - pxl.reduce((centerWidth, wiggleDistance) => centerWidth + wiggleDistance) / 3; // set pixel color to color or transparent depending on its RGB value

		let h = minThick + pxlB / (255 / (maxThick - minThick)); // dimension

    spiralCtx.strokeWidth = 1;
    svgExportCtx.strokeWidth = 1;

    // draw area
    if(params.isFilled === true) { // fill the area with color
      spiralCtx.fillRect(x, y, h, h);
      svgExportCtx.fillRect(x, y, h, h);
    } else { // just draw the border of the area
      spiralCtx.strokeRect(x, y, h, h);
      svgExportCtx.strokeRect(x, y, h, h);
    }
  }
};

const redraw = () => processImg(lastImg, imgCtx, params);

const preventDefault = event => {
  event.preventDefault();
};

// Draw image to the canvas after we drop it
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

const download = (filename, content) => {
  let pseudoLink = document.createElement("a");
  pseudoLink.setAttribute("href", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(content));
  pseudoLink.setAttribute("download", filename);

  pseudoLink.style.display = "none";
  document.body.appendChild(pseudoLink);

  pseudoLink.click();

  document.body.removeChild(pseudoLink);
}

downloadButton.addEventListener(
  "click", () => {
    let svg = svgExportCtx.getSerializedSvg();
    let filename = "export.svg";

    download(filename, svg);
  },
  false
);

window.addEventListener("drop", preventDefault);
window.addEventListener("dragover", preventDefault);
body.addEventListener("drop", handleDrop);