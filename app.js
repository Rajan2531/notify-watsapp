const express = require("express");
const bodyparser= require("body-parser");
const axios = require("axios");
const dotenv= require("dotenv");
var moment = require('moment')
const app=express();

dotenv.config({path:"./config.env"})
app.use(bodyparser.json());
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


const sendMessage=(phone_no_id,from,msg_body)=>{

    axios({
        method:"POST",
        url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+process.env.TOKEN,
        data:{
            messaging_product:"whatsapp",
            to:from,
            text:{
                body:"Hi, I am rajan's server, currently in development stage. Will be your reminder soon..."
            }
        },
        headers:{
            "Content-Type":"application/json"
        }
    })
}
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

            axios({
                method:"POST",
                url:"https://graph.facebook.com/v16.0/"+phone_no_id+"/messages?access_token="+process.env.TOKEN,
                data:{
                    messaging_product:"whatsapp",
                    to:from,
                    text:{
                        body:"Your task added!!!"
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }
            })
            setTimeout(sendMessage(phone_no_id,from,msg_body),5000);

            res.sendStatus(200);

           }
           else
           res.sendStatus(404); // 404 is not found
    }

})






module.exports=app;