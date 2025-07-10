const {YtDlp} = require('ytdlp-nodejs');


const ytdlp = new YtDlp();

async function getVideoInfo(url){
    const info = await ytdlp.getInfoAsync(url);
    return info;
}

module.exports = {
    getVideoInfo
}