//import { createCanvas, loadImage } from 'canvas'

export default class Container {
  static createContainer () {
    const container = document.createElement('div')
    container.id = 'app'
    const canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    const video = document.createElement('video')
    video.id = 'video'
    video.setAttribute('autoplay', '')
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    container.appendChild(video)
    container.appendChild(canvas)
    const loading = document.getElementById('loading')
    document.body.insertBefore(container, loading)
    const obj = { container: container, canvas: canvas, video: video }
    return obj
  }

  static createLoading (configData) {
    const loader = document.createElement('div')
    loader.id = 'loading'
    const logo = document.createElement('img')
    logo.src = configData.loading.logo.src
    logo.alt = configData.loading.logo.alt
    const loadingMessage = document.createElement('span')
    loadingMessage.setAttribute('class', 'loading-text')
    loadingMessage.innerText = configData.loading.loadingMessage
    loader.appendChild(logo)
    loader.appendChild(loadingMessage)
    document.body.insertBefore(loader, document.body.firstChild)
  }
}
