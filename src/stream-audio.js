const { createAudioResource, StreamType,VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { TextChannel, VoiceChannel } = require('discord.js');
const {YtDlp} = require('ytdlp-nodejs');

const ytdlp = new YtDlp();

const ServerQueue = {
    textChannel : null,
    voiceChannel:null,
    connection:null,
    player:null,
    songs:[],
    volume:1,
    playing:false
}

function initializeMusicStream(textChannel,voiceChannel,connection,player){
    //for the easy access
    ServerQueue.textChannel = textChannel;
    ServerQueue.voiceChannel = voiceChannel;
    ServerQueue.connection = connection;
    ServerQueue.player = player;
    /*****************************The Events for the connection and Music player******************************** */
    //event for when a song ends or stops
    ServerQueue.player.on(AudioPlayerStatus.Idle, ()=>{
        ServerQueue.songs.shift();//delete the first index
        if(ServerQueue.songs.lenght <= 0){//if there is no more songs in the playlist
            setTimeout(()=>{
                ServerQueue.textChannel.send("Since there is no more songs to play, I'll be leaving.");
                ServerQueue.connection.destroy();
            },1000*60*3)
            return;
        }
        //code for what will happen if songs are left
        playSong(ServerQueue.songs[0])//simply play the song for now
    })
    //Error Handling For the player
    ServerQueue.player.on("error",(error)=>{
        console.log("Error with in the music player : ", error.message);
        ServerQueue.textChannel.send("There was an erorr playing current song. Skipping to next.");

        // ServerQueue.songs.shift();
        // if(ServerQueue.songs.length <= 0){
        //     ServerQueue.textChannel.send("Since there is no more songs to play, I'll be leaving.");
        //     ServerQueue.connection.destroy();
         
        // }else{
        //     playSong(ServerQueue.songs[0])//simply play the song for now
        // }
        ServerQueue.player.stop();

    })
}
async function getVideoInfo(url){
    const info = await ytdlp.getInfoAsync(url);
    return {
        title: info.title,
        duraion:info.duration_string,
        url: info.url
    }
}

async function addToQueue(videoUrl){
    try {
        const {title,duration,url} = await getVideoInfo(videoUrl);
        ServerQueue.songs.push({
            title,
            duration,
            url
        })
        if(!ServerQueue.playing && ServerQueue.songs.length ===1){//case for first song in the entry
            playSong(ServerQueue.songs[0])
        }else{
            ServerQueue.textChannel.send(`${title} has been added to the queue.`)
        }
    } catch (error) {
        console.log("erorr in getting vidoe informaton : ",error.message)
        ServerQueue.textChannel.send("Error Occured when searching for the song info.")
    }
}

function playSong(song){
    const {title,duration,url} = song;
    if(!title && !duration && !url){
        ServerQueue.textChannel.send("Something was missing");
        !title && console.log("title was missing");
        !duration && console.log("duration was missing");
        !url && console.log("url was missing");
    }

    try {
        const ytdlpProcess = ytdlp.exec([
            url,
            '-f','bestaudio',
            '-o','-',
            '--no-playlist',
            '--quiet',
        ])
        if(!ytdlpProcess.stdout){
            console.error("Error! yt-dlp didn't return any std output.");
        }
        const resource = createAudioResource(ytdlpProcess.stdout,{
            metadata:{
                name: title,
                url:url,
            }
        })
        ServerQueue.player.play(resource);
        ServerQueue.connection.subscribe(ServerQueue.player)
    } catch (error) {
       console.log("Error on Creating Music Stream - ", error.message);
       ServerQueue.textChannel.send("couldn't create the stream. Tehee")
       ServerQueue.player.stop();
    }
}
function skipSong(){
    if(ServerQueue.player && ServerQueue.songs.length > 0){
        ServerQueue.player.stop();
        ServerQueue.textChannel.send("Song Skipped✅")
    }else{
        ServerQueue.textChannel.skip("No songs to skip. This is the final song")
    }
}
function pauseSong(){
    if(ServerQueue.playing && ServerQueue.player){
        ServerQueue.player.pause();
        ServerQueue.playing = false;
        ServerQueue.textChannel.send("The Song has been paused");
    }else{
        ServerQueue.textChannel.send("No song is playing");
    }
}
function resumeSong(){
    if(!ServerQueue.playing && ServerQueue.player){
        ServerQueue.player.unpause();
        ServerQueue.playing = true;
        ServerQueue.textChannel.send("The Song has been Resumed");
    }else{
        ServerQueue.textChannel.send("The track is going on");
    }
}
function getQueue(){
    return ServerQueue.songs;
}

module.exports ={
    initializeMusicStream,
    getVideoInfo,
    addToQueue,
    skipSong,
    pauseSong,
    resumeSong,
    getQueue
}