import ModuleLoader from './ModuleLoader'


export interface WebARKitPipeline {
  trackableLoaded?: (trackableId: number) => void;
  trackablesLoaded?: (trackableIds: number[]) => void;
  initialized: (cameraMatrix: number[]) => void;
  tracking: (world: any, trackableId: number) => void;
  trackingLost: () => void;
  // Inidcate the processing of the video frame. Good to trigger the rendering loop
  process: () => void;
}

export default class WebARKit {
  private instance;
  private version = '0.0.0' // <-- read from package.json;
  private pipeline: WebARKitPipeline;

  // construction
  constructor (pipeline: WebARKitPipeline) {
    console.info('WebARKit ', this.version)
    this.pipeline = pipeline;
  }
  // ---------------------------------------------------------------------------

  public startAR = () => {
    this.init();
    //@ts-ignore
    this.initTracking();  // this is a emscripten binding function

    // TODO: camera opening process
  }

  // initialization
  private init = async () => {
    const runtime = await ModuleLoader.init()
    this.instance = runtime.instance
    this._decorate()
    const scope = (typeof window !== 'undefined') ? window : global
    //@ts-ignore
    scope.webarkit = this
    this.pipeline.initialized(undefined);
  }

  private _decorate = () => {
    // add delegate methods
    [
      'test',
      'initTracking'
    ].forEach(method => {
      this[method] = this.instance[method]
    })

    // expose constants
    for (const co in this.instance) {
      if (co.match(/^WebAR/)) {
        this[co] = this.instance[co]
      }
    }
  }
}
