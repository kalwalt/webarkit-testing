var oWidth = window.innerWidth;
var oHeight = window.innerHeight;
var overlayCanvas;
var arElem;
console.log(WebARKit);
var videoEl = createVideo();
console.log(videoEl);
WebARKit.WebARKitController.init(videoEl, oWidth, oHeight, '../examples/config.json', 'akaze').then(wark => {
    console.log(wark);
    const refIm = document.getElementById("refIm");
    const gray = new WebARKit.GrayScaleMedia(refIm, refIm.width, refIm.height)
    console.log(gray);
    const imageData = gray.getFrame();
    console.log(imageData);
    createOverlayCanvas()
    arElem = document.getElementById("arElem");
    //setVideoStyle(videoEl);
    wark.loadTrackerGrayImage(imageData, refIm.width, refIm.height).then(_ => {
        var res;
        wark.startVideo(function (video) {
            initStats()
            arElem.style["transform-origin"] = "top left"; // default is center
            arElem.style.zIndex = 200;

            function update() {
                wark.process(video)
                drawCorners(wark.getCorners());
                console.log(wark.getCorners());
                arElem.style.display = "block";
                console.log(wark.getHomography());
                transformElem(wark.getHomography(), arElem)
                requestAnimationFrame(update)
            }
            update(video);
        })

        window.addEventListener('loadedvideo', function (e) {
            var rm = document.getElementById('loading');
            // rm.remove();
        })
    })
})

function initStats() {
    stats = new Stats();
    stats.showPanel(0);
    document.getElementById("stats").appendChild(stats.domElement);
}

function setVideoStyle(elem) {
    elem.style.position = "absolute";
    elem.style.top = 0;
    elem.style.left = 0;
}

function createVideo() {
    var video = document.createElement("video");
    video.id = "video";
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    return video;
}

function createOverlayCanvas() {
    overlayCanvas = document.createElement("canvas");
    setVideoStyle(overlayCanvas);
    overlayCanvas.id = "overlay";
    overlayCanvas.width = oWidth;
    overlayCanvas.height = oHeight;
    overlayCanvas.style.zIndex = 1;
    document.body.appendChild(overlayCanvas);
}

function transformElem(h, elem) {
    // column major order
    let transform = [h[0], h[3], 0, h[6],
    h[1], h[4], 0, h[7],
        0, 0, 1, 0,
    h[2], h[5], 0, h[8]
    ];
    transform = "matrix3d(" + transform.join(",") + ")";
    elem.style["-ms-transform"] = transform;
    elem.style["-webkit-transform"] = transform;
    elem.style["-moz-transform"] = transform;
    elem.style["-o-transform"] = transform;
    elem.style.transform = transform;
    elem.style.display = "block";
}

function clearOverlayCtx() {
    const overlayCtx = overlayCanvas.getContext("2d");
    overlayCtx.clearRect(0, 0, oWidth, oHeight);
}

function drawCorners(corners) {
    const overlayCtx = overlayCanvas.getContext("2d");
    clearOverlayCtx();

    overlayCtx.beginPath();
    overlayCtx.strokeStyle = "blue";
    overlayCtx.lineWidth = 3;

    // [x1,y1,x2,y2,x3,y3,x4,y4]
    overlayCtx.moveTo(corners[0], corners[1]);
    overlayCtx.lineTo(corners[2], corners[3]);
    overlayCtx.lineTo(corners[4], corners[5]);
    overlayCtx.lineTo(corners[6], corners[7]);
    overlayCtx.lineTo(corners[0], corners[1]);

    overlayCtx.stroke();
}