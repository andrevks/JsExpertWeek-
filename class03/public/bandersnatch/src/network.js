//This class represent everything related to URL and Internet
class Network {
    constructor({ host }){
        this.host = host
    }

    parseManifestURL({ url, fileResolution, fileResolutionTag, hostTag}){
        return url.replace(fileResolutionTag, fileResolution).replace(hostTag, this.host)
    }

    async fetchFile(url){
        //search for the file when the url is formated
        const response = await fetch(url)
        return response.arrayBuffer()
    }

    async getProperResolution(url){
        const startMs = Date.now()
        const response = await fetch(url)
        await response.arrayBuffer() 
        const endMs = Date.now()
        const durationInMs = (endMs - startMs)
        console.log('durationInMs', durationInMs) 
        
        //Instead of calculating by the throughPut
        //it'll be calculated by the duration
        const resolutions = [
            //Worst case scenario, 20 seconds
            { start: 3001, end: 20000, resolution: 144},
            //Until 3 seconds 
            { start: 901, end: 3000, resolution: 360},
            //less than 1 second 
            { start: 0, end: 900, resolution: 720},
        ]

        const item = resolutions.find(item => {
            return item.start <= durationInMs && item.end >= durationInMs
        })

        const LOWEST_RESOLUTION = 144
        if(!item) return LOWEST_RESOLUTION

        return item.resolution
    }
}