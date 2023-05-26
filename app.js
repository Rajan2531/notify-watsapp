const express = require("express");
const bodyparser= require("body-parser");
const axios = require("axios");
const dotenv= require("dotenv");
var moment = require('moment');
const { totalmem } = require("os");

const app=express();

dotenv.config({path:"./config.env"})
app.use(bodyparser.json());


///-----------------------------------


const monthName=new Map([
    ["0","jan"],
    ["1","feb"],
    ["2","mar"],
    ["3","apr"],
    ["4","may"],
    ["5","jun"],
    ["6","jul"],
    ["7","aug"],
    ["8","sep"],
    ["9","oct"],
    ["10","nov"],
    ["11","dec"]
])

function extractTime(msgBody)
{
const msgArray=msgBody.split(" ");
let inputDateAndTime;
let inputDate;
let inputYear;
let inputMonth;
let inputTime;
const date= new Date();
if(msgArray[msgArray.length-3].toLowerCase()=="today")
{
    inputDate=date.getDate();
    inputMonth=monthName.get((date.getMonth()).toString());
    inputYear=date.getFullYear();
    let timeFromMsgBody=msgArray[(msgArray.length-1)];
    if(timeFromMsgBody.includes('.'))
    timeFromMsgBody=timeFromMsgBody.replace('.',':');
    inputTime=timeFromMsgBody+":00";
    inputDateAndTime=inputMonth+" "+ inputDate + ", "+ inputYear+ " " +inputTime;


}
else if(msgArray[msgArray.length-3].toLowerCase()=="tomorrow")
{
    let date1=new Date();
    date1.setDate(date1.getDate()+1);
    inputDate=date1.getDate();
    inputMonth=monthName.get((date1.getMonth()).toString());
    inputYear=date1.getFullYear();
    
    let timeFromMsgBody=msgArray[(msgArray.length-1)];
    if(timeFromMsgBody.includes('.'))
   timeFromMsgBody= timeFromMsgBody.replace('.',':');
    inputTime=timeFromMsgBody+":00";
    inputDateAndTime=inputMonth+" "+ inputDate + ", "+ inputYear+ " " +inputTime;


}
else
{
    let receivedDate=msgArray[msgArray.length-3];
    if(receivedDate.includes('/'))
    receivedDate==receivedDate.replace('/','.');
    if(receivedDate.includes(':'))
    receivedDate=receivedDate.replace(':','.');
    if(receivedDate.includes('-'))
    receivedDate=receivedDate.replace('-','.');
    if(receivedDate.includes('/'))
    receivedDate=receivedDate.replace('/','.');

    let recievedDateArray=receivedDate.split('.');
    recievedDateArray[1]=recievedDateArray[1]/1;
    inputDate=recievedDateArray[0];

    inputMonth=monthName.get((recievedDateArray[1]-1).toString());
    inputYear=recievedDateArray[2];
    let timeFromMsgBody=msgArray[msgArray.length-1];
   
    if(timeFromMsgBody.includes("."))
    timeFromMsgBody=timeFromMsgBody.replace('.',':');
  
    inputTime=timeFromMsgBody+":00";
    inputDateAndTime=inputMonth+" "+ inputDate + ", "+ inputYear+ " " +inputTime;
    
    
}
return inputDateAndTime;
}


// chat gpt implementation ends her
app.get('/',(req,res)=>{
    console.log(req.body);
    res.json({
        status:"success"
    })
}
)

app.get("/webhook",(req,res)=>{
    let mode =req.query["hub.mode"];
    let challenge =req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if(mode&&token)
    {
        if(mode==="subscribe" && token === process.env.MYTOKEN)
        res.status(200).send(challenge);

    }
    else
    {
        res.status(403);  // 403 is forbidden response
    }

    
})



app.post("/webhook", (req,res)=>{
    let body_param=req.body;
    console.log(body_param);
    if(body_param.object)
    {
        if(body_param.entry &&
           body_param.entry[0].changes &&
           body_param.entry[0].changes[0].value.messages&&
           body_param.entry[0].changes[0].value.messages[0])
           {
            let phone_no_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
            let from = req.body.entry[0].changes[0].value.messages[0].from;
            let msg_body =req.body.entry[0].changes[0].value.messages[0].text.body;
            let msgArray=msg_body.split(' ');
            const message=msgArray[0];
            let time=extractTime(msg_body);
            let recievedTime=new Date(time);
            const currentTime= new Date();
            const timeDifference=(recievedTime-currentTime);
            console.log(timeDifference,typeof(timeDifference));
            const sendMessage=()=>{
                console.log(message);
                console.log("send message function was called as scheduled",Date.now().toLocaleString());

                axios({
                    method:"POST",
                    url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+process.env.TOKEN,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:`REMINDER \\n${message}`
                        }
                    },
                    headers:{
                        "Content-Type":"application/json"
                    }
                })
            }
            axios({
                method:"POST",
                url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+process.env.TOKEN,
                data:{
                    messaging_product:"whatsapp",
                    to:from,
                    text:{
                        body:`Your task "${message}" added. We will remind you on given time (${time})`
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }
            })
            setTimeout(sendMessage,timeDifference);

            res.sendStatus(200);

           }
           else
           res.sendStatus(404); // 404 is not found
    }

})






module.exports=app;