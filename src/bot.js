require("dotenv").config()
const {Client, GatewayIntentBits, IntentsBitField, EmbedBuilder } = require("discord.js");
const { joinVoiceChannel,getVoiceConnection, VoiceConnectionStatus, entersState, AudioPlayer, createAudioPlayer, } = require('@discordjs/voice');

//modules
const streamManager = require("./stream-audio.js")
const {keepAlive} = require("../server.js")
//another way of creating intents
const botIntents = new IntentsBitField();
botIntents.add(IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages,)
//a symbol that define what is the bot command
var SYMBOL = "&";

//new instance of bot
const femboy = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ],
})
//message interaction
femboy.on("messageCreate",async (message)=>{
    if(message.author.bot || !message.guild) return;
    const isCommand = message.content.startsWith(SYMBOL);
    if(!isCommand) return;//wont do anything if this is not a command
    //get the text with the "symbol" deleted
    const text = message.content.split(" ")[0].slice(1).toLowerCase();//get only the first word in the line
    console.log(message.author.username,text)

    switch (text) {
        case "chit-lrr?":
            await message.reply("Chit tl");
            break;
        case "pause":
            streamManager.pauseSong();
            break;
        case "resume":
            streamManager.resumeSong();
            break;   
        case "skip":
            streamManager.skipSong();
            break;
        case "queue":
            const queue = streamManager.getQueue();
            const queueEmbed = new EmbedBuilder()
                                        .setColor(0x0099FF)
                                        .setTitle("Server's Queue")
                                        .setFooter({text:"He is gonna suck you dry"})

            if(queue.length === 0){
                queueEmbed.addFields(
                    {name:"There is no songs currently",value:"Try playing a song"}
                )
                
            }else{
                // Add songs to the embed, respecting the 25-field limit
                for (let i = 0; i < Math.min(queue.length, 25); i++) {
                    const song = queue[i];
                    queueEmbed.addFields(
                        { name: song.title, value: `[Link](${song.url}) - (${song.duration})` }
                    );
                }

                // If there are more than 25 songs, add a note
                if (queue.length > 25) {
                    queueEmbed.addFields(
                        { name: "And more...", value: `Displaying 25 of ${queue.length} songs.`, inline: false }
                    );
                }
                        }   
            message.channel.send({ embeds: [queueEmbed] });
            break;
        default:
            await message.reply("There is no such command yet!");
            break;
    }
    

})
//event for slash commmands
femboy.on("interactionCreate",async (interaction)=>{
    if(!interaction.isChatInputCommand()) return;
    
    switch (interaction.commandName) {
        case "jorking":
            await interaction.reply("I am Cumming!!!! (ᗒᗣᗕ)՞");
            break;
        case "miku":
            await interaction.reply("Miku isn’t just a Vocaloid, she’s a lifestyle. We don’t just simp—we praise her. Every note she sings feels like a blessing straight from the digital heavens. Thursdays are officially reserved for thanking Miku, because in Miku we trust, and through autotune, we ascend. ");
            break;
        case "symbol":
            try {
                SYMBOL = interaction.options.getString("symbol") || SYMBOL;
                await interaction.reply(`current symbol is "${SYMBOL}"`);
            } catch (error) {
                console.log("Error on Changing Symbol",error)
                await interaction.reply("Oh no something went wrong! Check The Logs Pls");
            }
            break;
        case "join":
            const voiceChannel = interaction.member.voice.channel;
            if(!voiceChannel){
                await interaction.reply("You can't expect me to go there alone (⚆ᗝ⚆)");
                return;
            }
            try {
                let existingConnection = getVoiceConnection(interaction.guild.id);
                await interaction.deferReply()
                if(existingConnection){
                    if(existingConnection.joinConfig.channelId === voiceChannel.id){
                        await interaction.reply("I am already with you BAKA ٩◔̯◔۶");
                        return;
                    }else{
                        await interaction.reply("I don't know the shadow clone jutsu TwT");
                        return;
                    }
                }else{//no precursor connection
                    //create a new connection
                    SetupNewConnection(interaction)
                }
        
            } catch (error) {
                await interaction.reply("HELPPP I CAN'T JOIN THE VOICE CHANNEL%$^!&");
                console.log("error on joining channel : ",error)
            }
        
        
            await interaction.editReply("I'll let you enjoy the show!")
            break;
        case "play":{   
            try {
                await interaction.deferReply();//to convine discord that we are not disconnected (time out problem)
                const connection = getVoiceConnection(interaction.guild.id);
                if(connection){
                    const player = streamManager.getPlayer();
                    if(!player){
                        streamManager.initializeMusicStream(
                            interaction.channel,
                            interaction.member.voice.channel,
                            connection,
                            player);
                        }
                }
                //create  a whole new setup of player and connection if there is none
                await SetupNewConnection(interaction);
                //value will be the link or the name for the command
                const {value} = interaction.options.get("source");
                const {title,duration,url}= await streamManager.getVideoInfo(value)
                streamManager.addToQueue(value);
                //discord has time out 3 second . we need to  edit the reply to get around it
                await interaction.editReply(`A song is added.`)
                
                
            } catch (error) {
                console.log("Error on  Playing song : ",error);
                await interaction.editReply("Oh no something went wrong! Check The Logs Pls");
            }
            break;
        }
        case "begone":
            try{
                const connection = getVoiceConnection(interaction.guild.id);
                if(!connection){
                    await interaction.reply("I am not in any voice channels tho.");
                }else{
                    //delete and get out of vc
                    streamManager.resetServerQueue();
                    connection.destroy();
                    await interaction.reply("Jaa Ne (ゝз○`)");
                }
            }catch(error){
                console.log("error on leaving voice channel : ", error)
                await interaction.reply("Oh no something went wrong! Check The Logs Pls");
            }
            break;
        default:
            break;
        }
})


async function SetupNewConnection(interaction){
    const voiceChannel = interaction.member.voice.channel;

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });    
    connection.once(VoiceConnectionStatus.Ready,()=>{
        console.log("ready to rock in ", voiceChannel.name || "");
        const player = createAudioPlayer();
        //necessary for the other functions to work
        streamManager.initializeMusicStream(
            interaction.channel,
            interaction.member.voice.channel,
            connection,
            player);
        
    })
    connection.on(VoiceConnectionStatus.Disconnected,async (oldState,newState)=>{
        try{
            await Promise.race([
                entersState(connection,VoiceConnectionStatus.Connecting,5000),
                entersState(connection,VoiceConnectionStatus.Signalling,5000),
            ])
        }catch(error){
            interaction.channel.send("I am so lonely. I'm gonna go （◞‸◟）")
            connection.destroy();
        }
    })
}

femboy.on("ready",(client)=>{
    keepAlive();
    console.log(`Login as ${client.user.username}`);
})

femboy.login(process.env.CLIENT_TOKEN)

