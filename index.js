const express = require ("express");
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion} = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
 
 
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
        const serviceCollection = database.collection('Services');
        const userCollection = database.collection('Users');
        const reviewCollection = database.collection('Review');
        const messageCollection = database.collection('messages');
        const ordersCollection = database.collection('Orders');
        const paymentCollection = database.collection('Payments');
 
        //user

        // app.get('/review', async (req, res) => {
        //     const review = await reviewCollection.find().toArray();
        //     res.send(review);
        // });

 
        app.get('/user',async(req,res)=>{
            const query={};
            const cursor = userCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })


        

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

        app.delete("/user/:id",async(req,res)=>{
            const id = req.params.id;
            const filter ={_id : ObjectId(id)};
            const result= await userCollection.deleteOne(filter);
            res.send(result);
        })

        //Admin Api



        app.put('/user/admin/:email',async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
              $set: {role:'admin'}, //here we set a role for admins
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send({ result});
          })


          app.get('/admin/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email:email};
            const user = await userCollection.findOne(query);
            const isAdmin = user.role ==='admin';
            res.send({admin : isAdmin})
        })
       

        //review

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });


        app.get('/review', async (req, res) => {
            const review = await reviewCollection.find().toArray();
            res.send(review);
        });

        app.delete("/review/:id",async(req,res)=>{
            const id = req.params.id;
            const filter ={_id : ObjectId(id)};
            const result= await reviewCollection.deleteOne(filter);
            res.send(result);
        })
         
        // 

        //messages

        app.post('/message', async (req, res) => {
            const message = req.body;
            const result = await messageCollection.insertOne(message);
            res.send(result);
        });


        app.get('/message', async (req, res) => {
            const message = await messageCollection.find().toArray();
            res.send(message);
        });

        app.delete("/message/:id",async(req,res)=>{
            const id = req.params.id;
            const filter ={_id : ObjectId(id)};
            const result= await messageCollection.deleteOne(filter);
            res.send(result);
        })
         
        // service api

        app.get('/service',async(req,res)=>{
            const query={};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.post('/service', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        });
        
        app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const updateservice = req.body;
            const filter ={_id : ObjectId(id)};
            const options={upsert:true};
            const updatedDoc ={
                $set:{
                    title : updateservice.title,
                    price: updateservice.price,
                    img : updateservice.img,
                    details : updateservice.details,
                    // or just - updateservice
                }
            };
            const result = await serviceCollection.updateOne(filter,updatedDoc,options);
            res.send(result);
        });

        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const filter ={_id:ObjectId(id)};
            const result = await serviceCollection.deleteOne(filter);
            res.send(result);
        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const filter ={_id:ObjectId(id)};
            const result = await serviceCollection.findOne(filter);
            res.send(result);
        });

        //orders collection

        app.get("/orders",async(req,res)=>{
            const orders= await ordersCollection.find().toArray();
            res.send(orders);
        })

        
        app.get("/orders/:email",async(req,res)=>{
            const email = req.params.email;
            const filter ={email:email};
            const orders= await ordersCollection.find(filter).toArray();
            res.send(orders);
        })
        
        //my history
        app.get("/history/:email",async(req,res)=>{
            const email = req.params.email;
            const status ="Done";
            const filter ={
                email:email,
                status :status,

            };
            const orders= await ordersCollection.find(filter).toArray();
            res.send(orders);
        })

        app.delete("/orders/:id",async(req,res)=>{
            const id = req.params.id;
            const filter ={_id:ObjectId(id)};
            const result= await ordersCollection.deleteOne(filter);
            res.send(result);
        })

        app.post('/orders', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const order = req.body;
            // const filter = { 
            //     _id: (ObjectId(id)),
            //  };
            // const updateDoc = {
            //   $set: {
            //     paymentStatus: "complete",
            //     transecionId : order.transecionId,
            //   },
            // };
            // const payments = await paymentCollection.insertOne(payment);
            const orders = await ordersCollection.insertOne(order);
            // const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); 
            // res.send({ result,token});
            res.send(orders);
        });
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // const payment = req.body;
            const status = req.body.status;
            const filter = { 
                _id: (ObjectId(id)),
             };
            const updateDoc = {
              $set: {
                status: status,
                // transecionId : order.transecionId,
              },
            };
            // const payments = await paymentCollection.insertOne(payment);
            const orders = await ordersCollection.updateOne(filter,updateDoc);
            // const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); 
            // res.send({ result,token});
            res.send(updateDoc);
        });

        //client get with email api
        app.get('/orders/email/productName', async (req, res)=>{
            let query = {}
           const email = req.query.email;
           const productName = req.query.productName;
           if(email){
                query = {
                    email : email,
                    productName : productName,
                };
           }
            const result =await ordersCollection.findOne(query);
            res.send(result);
        });
        


        app.get("/paymentOrder/:id",async(req,res)=>{
            const id = req.params.id;
            const filter ={_id:ObjectId(id)};
            const result= await ordersCollection.findOne(filter);
            res.send(result);
        })

        // app.post('/orders', async (req, res) => {
        //     const order = req.body;
        //     const result = await ordersCollection.insertOne(order);
        //     // const token = jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); 
        //     // res.send({ result,token});
        //     res.send(result);
        // })
        

        
        app.post("/create-payment-intent", async (req, res) => {
            const service  = req.body;
            const price = service.price;
            const amount = price*100;
          
            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
              amount: amount,
              currency: "usd",
              payment_method_types:['card'],
            //   automatic_payment_methods: {
            //     enabled: true,
            //   },
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });

    }
    finally{
 
    }
}
run().catch(console.dir);
 
 
 
app.get('/',(req,res)=>{
    res.send('Hello World!')
});
 
app.listen(PORT, ()=>console.log(`server is running on Port ${PORT}`))