import WebARKit from './WebARKit'
import Utils from './utils/Utils'
import Container from './utils/html/Container'
import { createCanvas, loadImage } from 'canvas'
import ThreejsRenderer from './renderers/ThreejsRenderer'

export default class WebARKitController {
  constructor(){
    this.id
    this.width = 120
    this.height = 120
    this.videoWidth = 640
    this.videoHeight = 480
    //pointers
    this.framepointer = null
    this.framesize = null
    this.dataHeap = null
    this.frame2Dpointer = null
    this.frame2Dpointer = null
    this.frame2Dsize = null

    this.listeners = {}
    this.params
    this.webarkit
    this.config
    this.canvas
    this.canvasHeap
    this.root
  }

  static async init (videoWidth, videoHeight, config) {
    this.videoWidth = videoWidth
    this.videoHeight = videoHeight
    this.config = config
    // directly init with given width / height
    const webARC = new WebARKitController()
    return await webARC._initialize()
  }

  async _initialize () {
    const root = this.root
    // initialize the toolkit
    this.webarkit = await new WebARKit().init()
    console.log('[WebARKitController]', 'WebARKit initialized')

    this.id = this.webarkit.setup(this.videoWidth, this.videoHeight)
    console.log('[WebARKitController]', 'Got ID from setup', this.id)

    this.params = this.webarkit.frameMalloc
    this.framepointer = this.params.framevideopointer
    this.framesize = this.params.framevideosize

    this.dataHeap = new Uint8Array(this.webarkit.instance.HEAPU8.buffer, this.framepointer, this.framesize)

    const config = {
      "addPath": "",
      "cameraPara": "examples/Data/camera_para.dat",
      "videoSettings": {
        "width": {
          "min": 640,
          "max": 800
        },
        "height": {
          "min": 480,
          "max": 600
        },
        "facingMode": "environment"
      },
      "loading": {
        "logo": {
          "src": "data/arNFT-logo.gif",
          "alt": "arNFT.js logo"
        },
        "loadingMessage": "Loading, please wait..."
      },
      "renderer": {
        "type": "three",
        "alpha": true,
        "antialias": true,
        "precision": "mediump"
      }
    }

    Container.createLoading(config)
    //Container.createStats(stats)
    const containerObj = Container.createContainer()
    const container = containerObj.container
    this.canvas = containerObj.canvas
    this.canvasHeap = createCanvas(this.videoWidth, this.videoHeight)

    // the jsonParser need to be fixed, for now we load the configs in the old way...
    // const data = Utils.jsonParser(config)
    // data.then((configData) => {

    Utils.getUserMedia(config).then((video) => {
      this._copyImageToHeap(video)
    })

    //})

    if (config.renderer.type === 'three') {
      const renderer = new ThreejsRenderer(config, canvas, root)
      renderer.initRenderer()
      const tick = () => {
        renderer.draw()
        window.requestAnimationFrame(tick)
      }
      tick()
    }

    setTimeout(() => {
      this.dispatchEvent({
        name: 'load',
        target: this
      })
    }, 1)
    return this
  }

  loadTracker(url) {
    loadImage(url).then((image) => {
      this.width = image.width
      this.height = image.height
      console.log('Width of image is: ', this.width)
      console.log('Height of image is: ', this.height)

      const canvas = createCanvas(this.width, this.height)
      console.log('Creating the canvas...');
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, this.width, this.height)
      let data = ctx.getImageData(0, 0, this.width, this.height).data
      console.log('we get the data...');

      this.webarkit.imageSetup(this.width, this.height)

      this.frame2Dpointer = this.params.frame2Dpointer
      this.frame2Dsize = this.params.frame2Dsize

      this.image2Dframe = new Uint8Array(this.webarkit.instance.HEAPU8.buffer, this.frame2Dpointer, this.frame2Dsize)
      this._copyDataToImage2dFrame(data)
      console.log('Hey, i am here!');
      console.log(this.width);
      //console.log(this.dataHeap);
      console.log("id is: ", this.id);
      this.webarkit.initTracking(1, this.width, this.height)
      // removing loader page if present
      const loader = document.getElementById('loading')
      if (loader) {
        loader.querySelector('.loading-text').innerText = 'Start the tracking!'
        setTimeout(function () {
          loader.parentElement.removeChild(loader)
        }, 2000)
      }
    }).catch(err => {
  console.log('Error in loadImage:', err)
})
  }

  _copyDataToImage2dFrame(data) {
    if (this.image2Dframe) {
      this.image2Dframe.set(data)
      return true
    }
  }

  _copyImageToHeap(video) {
    this.ctx = this.canvasHeap.getContext('2d')
    this.ctx.save()
    this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight) // draw video
    this.ctx.restore()
    let imageData = this.ctx.getImageData(0, 0, this.videoWidth, this.videoHeight)
    let data = imageData.data
    if (this.dataHeap) {
      this.dataHeap.set(data)
      return true
    }
    return false
  }

  resetTracking () {
    this.webarkit.resetTracking(this.id, this.videoWidth, this.videoHeight)
  }

  track () {
    this.webarkit.track(this.id, this.videoWidth, this.videoHeight)
  }

  addEventListener(name, callback) {
    if(!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(callback);
  };

  removeEventListener(name, callback) {
    if(this.listeners[name]) {
      let index = this.listeners[name].indexOf(callback);
      if(index > -1) {
        this.listeners[name].splice(index, 1);
      }
    }
  };

  dispatchEvent(event) {
    let listeners = this.listeners[event.name];
    if(listeners) {
      for(let i = 0; i < listeners.length; i++) {
        listeners[i].call(this, event);
      }
    }
  };
}
