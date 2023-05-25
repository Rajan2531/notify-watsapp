const express = require("express");
const bodyparser= require("body-parser");
const axios = require("axios");
const dotenv= require("dotenv");
var moment = require('moment')

const app=express();

dotenv.config({path:"./config.env"})
app.use(bodyparser.json());




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
            const message=msg_body.slice(0,msg_body.length-21)
            let time=msg_body.slice(msg_body.length-18,msg_body.length)+":00";
            let recievedTime=new Date(time);
            const currentTime= new Date();
            const timeDifference=recievedTime-currentTime;
            const sendMessage=()=>{

                axios({
                    method:"POST",
                    url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+process.env.TOKEN,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:message
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
                        body:`Your task "${message}" added!!!`
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