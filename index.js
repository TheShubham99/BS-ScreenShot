require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.on('message', message => {
      var msg=message.content;

    if (msg.startsWith('!Snaptest')) {
    
        msg=msg.replace('!Snaptest','');
        
        msg=msg.split(' -')
        if(msg.length==3){
            message.reply("Website is **"+msg[1]+"**");
            message.reply("Device is **"+msg[2]+"**");
        }
        else{
            message.reply("Wrong Parameters, Type `bs-help` to know more. ");
        }

      //msg.reply('Pong!');
    }
  });
  
  client.login(process.env.DISCORD_BOT_TOKEN);