//Everything involving an element of a video will be here
class VideoMediaPlayer {
    constructor({ manifestJSON, network }) { 
        this.manifestJSON = manifestJSON
        this.network = network

        this.videoElement = null
        this.sourceBuffer = null
        this.selected = {}
        this.videoDuration = 0
    }

    initializeCodec() {
        this.videoElement = document.getElementById("vid")
        //If MediaSource is not in window object, the browser does't 
        //support it
        const mediaSourceSupported = !!window.MediaSource
        if(!mediaSourceSupported){
            alert('Your browser or system does\'t support MediaSource')
            return;
        }
        //Verify wheter the video or audio format is supported
        const codecSupported = MediaSource.isTypeSupported(this.manifestJSON.codec)
        if(!codecSupported){
            alert(`Your browser does\'t support the codec: ${this.manifestJSON.codec}`)
            return;
        }

        const mediaSource = new MediaSource()
        this.videoElement.src = URL.createObjectURL(mediaSource)


        mediaSource.addEventListener("sourceopen", this.sourceOpenWrapper(mediaSource) )
    }

    sourceOpenWrapper(mediaSource){
        return async(_) =>{
            this.sourceBuffer = mediaSource.addSourceBuffer(this.manifestJSON.codec)
            //console.log("this.manifestJSON.intro",this.manifestJSON.intro)
            //this.manifestJSON.intro.url = "$HOST/timeline/01.intro/01.intro-12.733333-$RESOLUTION.mp4"
            const selected = this.selected = this.manifestJSON.intro
            //console.log("this.manifestJSON.intro",this.manifestJSON.intro)
            //Prevent run as "live"
            mediaSource.duration = this.videoDuration 
            console.log("selected.url",selected.url)
            await this.fileDownload(selected.url)
        }
    }

    async fileDownload(url){
        const prepareUrl = {
            url,
            fileResolution: 360,
            fileResolutionTag: this.manifestJSON.fileResolutionTag,
            hostTag: this.manifestJSON.hostTag
        }
        console.log("PrepareUrl: ",prepareUrl)
        const finalUrl = this.network.parseManifestURL(prepareUrl)
        console.log("finalUrl",finalUrl)
        this.setVideoPlayerDuration(finalUrl)
        const data = await this.network.fetchFile(finalUrl)
        return this.processBufferSegments(data)
    }

    setVideoPlayerDuration(finalURL){
        const bars = finalURL.split('/')
        console.log("bars: ",bars)
        console.log("lastPos:", bars[bars.length -1].split('-'))
        const [ name, videoDuration] = bars[bars.length - 1].split('-')
        console.log("name:",name," videoDuration:",videoDuration)
        this.videoDuration += videoDuration
        console.log("videoDuration NOW: ",this.videoDuration)
    }

    async processBufferSegments(allSegments){
        const sourceBuffer = this.sourceBuffer
        console.log("sourceBuffer",sourceBuffer)
        sourceBuffer.appendBuffer(allSegments) 
         
        return new Promise((resolve, reject) =>{
            const updateEnd = (_) =>{
                sourceBuffer.removeEventListener("updateend", updateEnd)
                sourceBuffer.timestampOffset = this.videoDuration 

                return resolve()
            }

            sourceBuffer.addEventListener("updateend", updateEnd)
            sourceBuffer.addEventListener("error", reject)
        })
    }
}