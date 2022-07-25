const express = require ("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion} = require('mongodb');
 
 
const app = express();
const PORT = process.env.PORT || 4000;
 
 
//middleware/
 
app.use(cors());
app.use(express.json());
 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5f7tq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 
 
async function run (){
    try{
        await client.connect();
        console.log('database connected successfully');
        const database = client.db("Jerins-parlour");
        const servicesCollection = database.collection('Services');
        const userCollection = database.collection('Users');
 
 
 
        app.get('/user',async(req,res)=>{
            const query={};
            const cursor = userCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })


        //user

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
              $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            // const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            // res.send({ result,token});
            res.send(result);
        })

    }
    finally{
 
    }
}
run().catch(console.dir);
 
 
 
app.get('/',(req,res)=>{
    res.send('Hello World!')
});
 
app.listen(PORT, ()=>console.log(`server is running on Port ${PORT}`))