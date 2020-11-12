require('dotenv').config();
var fs = require('fs');

const fetch = require("node-fetch");
var browser_list;


// Load browser List
fs.readFile('./browsers.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  browser_list=JSON.parse(data);  
});

var BrowserStack = require("browserstack");
var browserStackCredentials = {
    username: process.env.BSTACK_USER,
    password: process.env.BSTACK_PASS
};

// REST API
var screenshotClient = BrowserStack.createScreenshotClient(browserStackCredentials);
var screenshots_obj;

async function checkStatus(job_id){
  
  await fetch(`https://www.browserstack.com/screenshots/`+job_id+`.json`).then(async (ss_obj)=>{
    
    screenshots_obj=await ss_obj.json();
    screenshots_obj=screenshots_obj.screenshots;
    console.log("Checking if screenshot is captured... :");
    if(screenshots_obj[0].thumb_url===null){
      setTimeout(()=>{
        console.log("Trying Again...")
        checkStatus(job_id)}
        ,10000)
    }
    else{
      console.log("Snap.. Gotcha... sharing the screenshot in 3..2..1..")
    }
}).catch((e)=>{
  console.log("Fetching the ScreenShot job status again...")
})

}

async function captureScreenShot(website_url,browser){
  var options={
    url:website_url,
    browsers:[browser]
  }

  screenshotClient.generateScreenshots(options, async (error,job)=>{
    if(!error){
        setTimeout(()=>checkStatus(job.job_id),1000);      
    }
    else{
      console.log(error);
    }

  })

} 


//Discord Initialization 

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
            captureScreenShot(msg[1],browser_list[msg[2].toString()]);
            message.reply("Please Wait..Fetching the Screenshot...");  
            var loop=setInterval(()=>{

              if(screenshots_obj[0].thumb_url===null){
                  setTimeout(()=>checkStatus(),1000);
              }
               else{ 
              clearInterval(loop);
              message.reply("**Thumbnail: **"+screenshots_obj[0].thumb_url);
              message.reply("**Original Image: **"+screenshots_obj[0].image_url);
               }
            },10000)
        }
        else{
            message.reply("Wrong Parameters, Type `bs-help` to know more. ");
        }
    }
    else if(msg==="bs-help"){
      message.reply("Working on the help feature.");
    }
    else if(msg==='bs-browsers'){
      message.reply(browser_list);
    }
  });
  
  client.login(process.env.DISCORD_BOT_TOKEN);