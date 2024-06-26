async function loadSpeedyImage(id) {
    // Load an image
    console.warn('Loading speedy-media for the image tracker...');
    const img = document.getElementById(id);
    const media = await Speedy.load(img);

    // Setup the pipeline
    const pipeline = Speedy.Pipeline(); // create the pipeline and the nodes
    const source = Speedy.Image.Source();
    const sink = Speedy.Image.Sink();
    
    console.log(SpeedyVisionSinkImageData);

    //const textureReader = new SpeedyVisionSinkImageData.TextureReader()
    //console.log(textureReader)

    //const sinkIData  = new SpeedyVisionSinkImageData.default.prototype.constructor()
    //console.log(sinkIData)
    const greyscale = Speedy.Filter.Greyscale();

    source.media = media; // set the media source

    source.output().connectTo(greyscale.input()); // connect the nodes
    greyscale.output().connectTo(sink.input());
    //greyscale.output().connectTo(sinkIData.input());

    pipeline.init(source, sink, greyscale); // add the nodes to the pipeline
    //pipeline.init(source, sinkIData, greyscale); // add the nodes to the pipeline


    const { image } = await pipeline.run(); // image is a SpeedyMedia
    console.log(image)

    //var texture;
    //textureReader.readPixels(pipeline._gpu, texture)

    const canvas = setupCanvas("canvas_load", image.width, image.height,'pinball');

    return getImgData(image, canvas);
}

async function loadSpeedyVideo(id) {
    console.warn('Loading speedy-media for video...');

    // Load a video
    const video = document.getElementById(id);
    const media = await Speedy.load(video);

    // Setup the pipeline
    const pipeline = Speedy.Pipeline(); // create the pipeline and the nodes
    const source = Speedy.Image.Source();
    const sink = Speedy.Image.Sink();
    const mux = Speedy.Image.Multiplexer();
    const greyscale = Speedy.Filter.Greyscale();
    const nightvision = Speedy.Filter.Nightvision();

    source.media = media; // set the media source

    source.output().connectTo(greyscale.input());  // connect the nodes
    source.output().connectTo(mux.input('in0'));
    greyscale.output().connectTo(mux.input('in1'));
    mux.output().connectTo(nightvision.input());
    nightvision.output().connectTo(sink.input());

    pipeline.init(source, sink, mux, greyscale, nightvision); // add the nodes to the pipeline

    var oWidth = window.innerWidth;
    var oHeight = window.innerHeight;

    var data;

    (function () {
        const off = new OffscreenCanvas(oWidth, oHeight)
        const ctx = off.getContext('2d', { willReadFrequently: true })
        let image = null, frameReady = false;

        async function update() {
            mux.port =  1;

            nightvision.gain = 0.5;
            nightvision.offset = 0.5;
            nightvision.decay = 0.1;
            nightvision.quality = "medium";

            const result = await pipeline.run(); // image is a SpeedyMedia
            image = result.image;
            //console.log(image)
            frameReady = true;
            setTimeout(update, 1000 / 60);
        }

        update();

        function process() {
            if (frameReady) {
                ctx.drawImage(image.source, 0, 0);
                data = ctx.getImageData(0, 0, oWidth, oHeight);
                const event = new CustomEvent("process_data", { detail: { data: data } });
                document.dispatchEvent(event);         
            }
            frameReady = false;
            requestAnimationFrame(process)
        }

        process();
    
        setInterval(() => renderStatus(), 200);
    })();

    return true;
}

function getImgData(img, canvas, width = img.width, height = img.height) {

    const ctx = canvas.getContext('2d')

    ctx.drawImage(img.source, 0, 0,  width, height);
    let data = ctx.getImageData(0, 0, width, height);

    return data.data;
}

function renderStatus(arr = null, label = 'Keypoints') {
    const status = document.getElementById('status');

    if (Array.isArray(arr))
        status.innerText = `FPS: ${Speedy.fps} | ${label}: ${arr.length}`;
    else
        status.innerText = `FPS: ${Speedy.fps}`;
}

function setupCanvas(id, width, height, title = '')
{
    const canvas = document.getElementById(id);

    if(canvas) {
        canvas.width = width;
        canvas.height = height;
        canvas.title = title;
    }

    return canvas;
}