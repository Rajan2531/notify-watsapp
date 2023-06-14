




const {Configuration, OpenAIApi} = require("openai");

const configuration = new Configuration({
    apiKey:process.env.OPENAI_API_KEY
})


const openai =new OpenAIApi(configuration);


 async function generate1(question){
    try{
        const question ="write an intern resume."
        
        const completion = await openai.createCompletion({
            model:"babbage",
            prompt:question,
            temperature:0.6,
            
        });
        console.log(completion.data.choices[0])
       
    }
    catch(err)
    {
        console.log(err);
    }
}


