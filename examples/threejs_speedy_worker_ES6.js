//var oWidth = window.innerWidth;
//var oHeight = window.innerHeight;
var oWidth = 1280
var oHeight = 720;

function isMobile () {
  return /Android|mobile|iPad|iPhone/i.test(navigator.userAgent);
}

var setMatrix = function (matrix, value) {
  var array = [];
  for (var key in value) {
    array[key] = value[key];
  }
  if (typeof matrix.elements.set === "function") {
    matrix.elements.set(array);
  } else {
    matrix.elements = [].slice.call(array);
  }
};

function start(input_width, input_height, render_update, track_update) {
  var vw, vh;
  var sw, sh;
  var pscale, sscale;
  var w, h;
  var pw, ph;
  var ox, oy;
  var worker;

  var targetCanvas = document.querySelector("#canvas");

  var renderer = new THREE.WebGLRenderer({ canvas: targetCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  var scene = new THREE.Scene();

  var camera = new THREE.Camera();
  camera.matrixAutoUpdate = false;

  scene.add(camera);

  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8),
    new THREE.MeshNormalMaterial()
  );

  var root = new THREE.Object3D();
  scene.add(root);

  var marker;

  sphere.material.flatShading;
  sphere.scale.set(.5, .5, .5);

  root.matrixAutoUpdate = false;
  root.add(sphere);

  var load = function () {
    vw = input_width;
    vh = input_height;

    pscale = 320 / Math.max(vw, vh / 3 * 4);
    sscale = isMobile() ? window.outerWidth / input_width : 1;

    sw = vw * sscale;
    sh = vh * sscale;

    w = vw * pscale;
    h = vh * pscale;
    pw = Math.max(w, h / 3 * 4);
    ph = Math.max(h, w / 4 * 3);
    ox = (pw - w) / 2;
    oy = (ph - h) / 2;

    renderer.setSize(sw, sh);

    worker = new Worker('./worker_threejs.js')

    const refIm = document.getElementById("refIm");
    var type = setTrackerType();

    loadSpeedyImage('refIm').then(img => {
      worker.postMessage({
        type: "initTracker",
        trackerType: type,
        imageData: img,
        imgWidth: refIm.width,
        imgHeight: refIm.height,
        videoWidth: oWidth,
        videoHeight: oHeight,
      });
    });

    worker.onmessage = function (ev) {
      var msg = ev.data;
      switch (msg.type) {
        case "loadedTracker": {
          var proj = JSON.parse(msg.cameraProjMat);
          var ratioW = pw / w;
          var ratioH = ph / h;
          proj[0] *= ratioW;
          proj[4] *= ratioW;
          proj[8] *= ratioW;
          proj[12] *= ratioW;
          proj[1] *= ratioH;
          proj[5] *= ratioH;
          proj[9] *= ratioH;
          proj[13] *= ratioH;
          setMatrix(camera.projectionMatrix, proj);
          break;
        }
        case "endLoading": {
          if (msg.end == true) {
            // removing loader page if present
            var loader = document.getElementById('loading');
            if (loader) {
              loader.querySelector('.loading-text').innerText = 'Start the tracking!';
              setTimeout(function(){
                loader.parentElement.removeChild(loader);
              }, 2000);
            }
          }
          break;
        }
        case 'found': {
          found(msg);
          break;
        }
        case 'not found': {
          found(null);
          break;
        }
      }
      track_update();
    };
  };

  var world;

  var found = function (msg) {
    if (!msg) {
      world = null;
    } else {
      world = JSON.parse(msg.pose);
    }
  };

  var draw = function () {
    render_update();

    if (!world) {
      sphere.visible = false;
    } else {
      sphere.visible = true;
      setMatrix(root.matrix, world);
    }
    renderer.render(scene, camera);
  };

  var process = function (){
    
    loadSpeedyVideo('video');

    document.addEventListener('process_data', function(e){
      worker.postMessage({ type: 'process', data: e.detail.data.data.buffer }, );
  })
   
  }

  var tick = function () {
    draw();
    requestAnimationFrame(tick);
  };

  load();
  process();
  tick();
}
