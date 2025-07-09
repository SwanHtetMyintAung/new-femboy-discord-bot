const { createAudioResource, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

async function playYouTubeAudio(connection, player, videoUrl) {
    try {
        const stream = ytdl(videoUrl, {
            filter: 'audioonly', // Get only the audio stream
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // Optimize buffering for Discord
        });

        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary, // Tells @discordjs/voice that this is an arbitrary stream (ytdl-core output)
            inlineVolume: true // Allows controlling volume via the resource
        });

        player.play(resource);
        connection.subscribe(player);

        console.log('Now playing YouTube audio!');
    } catch (error) {
        console.error('Error playing YouTube audio:', error);
    }
}
module.exports = {
    playYouTubeAudio
}
