require("dotenv").config();
const { REST, Routes, DiscordjsRangeError} = require('discord.js')

//the name has to be in small letters
const commands = [
    {
        name:"jorking",
        description: "jork the femboy"
    },
    {
        name:"miku",
        description:"Miku"
    },
    {
        name:"symbol",
        description:"check what's the current symbol!",
        options:[
            {
                name:"symbol",
                description:"Set New Symbol",
                type:3,
            }
        ]
    }
]

const rest = new REST({version:"10"}).setToken(process.env.CLIENT_TOKEN);

(async() => {
    try {
        console.log("setting up slash commands");

        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), 
        {
            body:commands
        })

        console.log("slash commands successfully addede");

    } catch (error) {
        console.log("There is an error: ", error)
    }
})()