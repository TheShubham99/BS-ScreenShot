/* <Initialization>*/

require('dotenv').config();
var fs = require('fs');

const fetch = require("node-fetch");

// Stores List of Browsers described in browser.json
var browser_list;

// Default out_message
var out_message="Pending";

// Job Id to check the status, 0 is a default value
var job_id=0;

// Message shown for help command
const help_msg="\n **About BS-Snap Bot**\n _This bot is made for testing out any website on various devices._\n\n **What It will do? **\n_It will send you the screenshots of the website you mentioned in the command._";
const commands=` 
**Commands: ** 

1️⃣ 

> **!snap -<url> -<device>** 

_Takes a screenshot of <url> using <device>._
                                  
**Try**  !snap -https://google.com -windows-chrome\n
**_<url>_** : https://google.com
**_<device>_** : windows-chrome

2️⃣

> **!bs-devices** 

_Returns the list of supported devices._

3️⃣

> **!bs-out -<token>**

_Checks the status of the screenshot job and returns the screenshot if the job is completed._

4️⃣

> **!bs-help**

_Returns this menu._
`;

/* <Initialization End> */
/* ---------------------------------------------------------------- */


// Load browser List
fs.readFile('./browsers.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  browser_list=JSON.parse(data);  
});


// Initiate BrowserStack

var BrowserStack = require("browserstack");
var browserStackCredentials = {
    username: process.env.BSTACK_USER,
    password: process.env.BSTACK_PASS
};

// ScreenShot API Initiallization

try {
    var screenshotClient = BrowserStack.createScreenshotClient(browserStackCredentials);
}
catch(e) {
    console.log("Couldn't login.. Please check for existing session...")
}

// Default/Empty Screenshot object
var screenshots_obj=[{"thumb_url":null}];


// Check if ScreenShot is Captured and saves the message to out_message.
async function checkStatus(job_id){
  
    await fetch(`https://www.browserstack.com/screenshots/`+job_id+`.json`).then(async (ss_obj)=>{
      
      screenshots_obj=await ss_obj.json();
      screenshots_obj=screenshots_obj.screenshots;
      console.log("Checking if screenshot is captured... :");
      if(screenshots_obj[0].thumb_url===null){
            out_message="Pending";

      }
      else{
        out_message="\n**Thumbnail: **"+screenshots_obj[0].thumb_url+"\n\n**Original Image: **"+screenshots_obj[0].image_url;
        console.log("Snap.. Gotcha... sharing the screenshot in 3..2..1..");
      }

      }).catch((e)=>{
        console.log("Fetching the ScreenShot job status again...");
      })

}

// Starts Capture Job
async function captureScreenShot(website_url,browser){
  var options={
    url:website_url,
    browsers:[browser]
  }

  screenshotClient.generateScreenshots(options, async (error,job)=>{
    if(!error){
        // set the generated job Id 
        job_id=job.job_id;      
    }
    else{
       // reset the Job Id if capture fails
        job_id=0; 
   }
  })
} 


// Discord Initialization 

const Discord = require('discord.js');
const client = new Discord.Client();


// Discord Listners
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  client.on('message', message => {
      var msg=message.content;

    if (msg.startsWith('!snap')) {
    
        msg=msg.replace('!snap','');
        
        msg=msg.split(' -')
        if(msg.length==3){
            try{
            captureScreenShot(msg[1],browser_list[msg[2].toString().toLowerCase()]);
            
            message.reply("Please Wait..Fetching the Screenshot...");  
            
            setTimeout(()=>{
              if(job_id!==0)
                message.reply("**Your request is in the Queue.**\n\nRun `!bs-out "+job_id+'` after a minute to see the results.\n Run `bs-help` to understand the commands.');
                job_id=0;
            },2000)
            
          }catch(e){
            message.reply("Wrong parameters or device name.\n Run `bs-help` to view the commands.");
          }
        }
        else{
            message.reply("Wrong Parameters, Type `bs-help` to know more. ");
        }
    }
    else if(msg==="!bs-help"){
      message.reply(help_msg+"\n"+commands);
    }
    else if(msg==='!bs-devices'){
      var devices=Object.keys(browser_list);

      var devices_message="\n**Supported Devices: **\n\n";
      for(device in devices){
          
          device=devices[device];

          devices_message=devices_message+"**`"+device+"`**\n";
      }

      message.reply(devices_message);

    }
    else if(msg.startsWith('!bs-out ')){
      message.reply("Checking the job status...")
      msg=msg.replace('!bs-out ','');
      checkStatus(msg);
      setTimeout(()=>{
        if(out_message==="Pending"){
          message.reply("Your request is still processing.. Please try later..")
        }
        else{  
          message.reply("**Images :** "+out_message)
          out_message="Pending";
        }
      },5000)
    }
  });
  

  // Discord Login
  try{
  client.login(process.env.DISCORD_BOT_TOKEN);
  }
  catch(e){
    console.log("Discord Login Failed")
  }