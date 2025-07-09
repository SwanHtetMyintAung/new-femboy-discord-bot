require("dotenv").config()
const {Client, GatewayIntentBits, IntentsBitField } = require("discord.js");
const { joinVoiceChannel,getVoiceConnection, VoiceConnectionStatus, entersState, AudioPlayer, createAudioPlayer } = require('@discordjs/voice');

//modules
const { playYouTubeAudio } = require("./stream-audio.js")
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
            SYMBOL = interaction.options.getString("symbol") || SYMBOL;
            await interaction.reply(`current symbol is "${SYMBOL}"`);
            break;
        case "join":
            const voiceChannel = interaction.member.voice.channel;
            if(!voiceChannel){
                await interaction.reply("You can't expect me to go there alone (⚆ᗝ⚆)");
                return;
            }
            try {
                let existingConnection = getVoiceConnection(interaction.guild.id);
                console.log(existingConnection)
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
                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                    });    
                    connection.on(VoiceConnectionStatus.Ready,()=>{
                        console.log("ready to rock in ", voiceChannel.name || "");
                    })
                    connection.on(VoiceConnectionStatus.Disconnected,async (oldState,newState)=>{
                        try{
                            await Promise.race([
                                entersState(connection,VoiceConnectionStatus.Connecting,5000),
                                entersState(connection,VoiceConnectionStatus.Signalling,5000),
                            ])
                        }catch(error){
                            await interaction.channel.send("I am so lonely. I'm gonna go （◞‸◟）")
                            connection.destroy();
                        }
                    })
                }

            } catch (error) {
                await interaction.reply("HELPPP I CAN'T JOIN THE VOICE CHANNEL%$^!&");
                console.log("error on joining channel : ",error)
            }


            await interaction.reply("I'll let you enjoy the show!")
            break;
        case "play":{   
            const connection = getVoiceConnection(interaction.guild.id);
            if(!connection){
                await interaction.reply("I have to be in a channel first.");
                return;
            }
            const player = createAudioPlayer();
            if(!player){
                console.log("Couldn't create audio player");
                return;
            }
            //value will be the link or the name for the command
            const {value} = interaction.options.get("source");
            console.log(url);
            await playYouTubeAudio(connection,player,value);
            break;
        }
        case "begone":
            const connection = getVoiceConnection(interaction.guild.id);
            if(!connection){
                await interaction.reply("I am not in any voice channels tho.");
            }else{
                //delete and get out of vc
                connection.destroy();
                await interaction.reply("Jaa Ne (ゝз○`)");
            }
            break;
        default:
            break;
        }
})

femboy.on("ready",(client)=>{
    console.log(`Login as ${client.user.username}`);
})

femboy.login(process.env.CLIENT_TOKEN)

