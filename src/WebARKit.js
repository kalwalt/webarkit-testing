import ModuleLoader from './ModuleLoader'

export default class WebARKit {
  // construction
  constructor () {
    // reference to WASM module
    this.instance
    this.version = '0.0.0'
    console.info('WebARKit ', this.version)
  }
  // ---------------------------------------------------------------------------

  // initialization
  async init () {
    const runtime = await ModuleLoader.init()
    this.instance = runtime.instance
    this._decorate()
    const scope = (typeof window !== 'undefined') ? window : global
    scope.webarkit = this

    return this
  }
  _decorate () {
    // add delegate methods
    [
      'test',
      'setup',
      'imageSetup',
      'initTracking',
      'resetTracking',
      'track'
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
