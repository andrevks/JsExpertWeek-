const MANIFEST_URL = 'manifest.json'
//Any of the following option means localhost
const localHost = ['127.0.0.1','localhost']

async function main() {
    //If any of the strings are in the hostname, so the code is local
    const isLocal = !!~localHost.indexOf(window.location.hostname)
    console.log('isLocal ?', isLocal)
    const manifestJSON = await (await fetch(MANIFEST_URL)).json() 
    const host = isLocal ? manifestJSON.localHost : manifestJSON.productionHost
    const videoComponent = new VideoComponent()
    const network = new Network({ host })
    const videoPlayer = new VideoMediaPlayer({
        manifestJSON,
        network
    })

    videoPlayer.initializeCodec()
    videoComponent.initializePlayer()
}

window.onload = main