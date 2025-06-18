require("dotenv").config()
const {Client, GatewayIntentBits, IntentsBitField } = require("discord.js");
//another way of creating intents
const botIntents = new IntentsBitField();
botIntents.add(IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages,)
//a symbol that define what is the bot command
var SYMBOL = "&";

//new intance of bot
const femboy = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
})
//message interaction
femboy.on("messageCreate",async (message)=>{
    if(message.author.bot) return;
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
        default:
            break;
        }
})

femboy.on("ready",(client)=>{
    console.log(`Login as ${client.user.username}`);
})

femboy.login(process.env.CLIENT_TOKEN)

