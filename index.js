require('dotenv').config();
const fetch = require("node-fetch");

var BrowserStack = require("browserstack");
var browserStackCredentials = {
    username: process.env.BSTACK_USER,
    password: process.env.BSTACK_PASS
};

var browser_one;

// REST API
var screenshotClient = BrowserStack.createScreenshotClient(browserStackCredentials);
 
async function captureScreenShot(website_url,browser){
  var options={
    url:website_url,
    browsers:[browser]
  }

  screenshotClient.generateScreenshots(options, async (error,job)=>{
    if(!error){
        console.log(job['job_id']);
        
        
       async function checkStatus(){

          var out="None";
        
       await screenshotClient.getJob(job.job_id, async (error,job)=>{
            if(!error){
              console.log("Success ");
                out=JSON.stringify(job);
              }
            
            else{
              out="get job failed";
            }
        })
      
        return out;
      }

        checkStatus().then((s)=>{
          console.log(s);
        });

        var screenshot_res;
        await fetch(`https://www.browserstack.com/screenshots/`+job.job_id+`.json`).then(async (r)=>{
          screenshot_res=r;
          let screenshots_obj=await screenshot_res.json();
           screenshots_obj=screenshots_obj.screenshots;
           console.log("SCREENSHOTS :");
           console.log(screenshots_obj);
 
        }).catch((c)=>{

        })
    }
    else{
      console.log(error);
    }

  })

} 

 screenshotClient.getBrowsers(function(error, browsers) {
    console.log("The following browsers are available for testing");
    console.log(browsers[0]);
    browser_one=browsers[0];
});


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
            captureScreenShot(msg[1],browser_one);
        }
        else{
            message.reply("Wrong Parameters, Type `bs-help` to know more. ");
        }
    }
    else if(msg==="bs-help"){
      message.reply("Working on the help feature.");
    }
    else if(msg==='bs-browsers'){
      message.reply(browser_one);
    }
  });
  
  client.login(process.env.DISCORD_BOT_TOKEN);