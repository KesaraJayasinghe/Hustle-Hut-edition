const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const port = 3000
// console.log("Db user name", process.env.DB_USER)




app.use(cors());
app.use(express.json())


// // HustleHut-un,pw

// // hasithajayakesara- UN
// // NSvf1Y05Uejc4ezQ - PW


// // Mongo connection



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cizd92y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();




        const database = client.db("Cluster0");

        const userCollections = database.collection("users");

        const classesCollections = database.collection("classes");

        const cartCollections = database.collection("cart");

        const paymentCollections = database.collection("payments");

        const enrolledCollections = database.collection("enrolled");

        const appliedCollections = database.collection("applied");


        app.post('/new-class', async (req, res) => {
            const newClass = req.body;


            const result = await classesCollections.insertOne(newClass);
            res.send(result);
        })











        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        // Ensures that the client will close when you finish/error
        console.error(" MongoDB connection error:", error);
    }
}
run().catch(console.dir);

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = 'mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cizd92y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//     serverApi: {
//         version: ServerApiVersion.v1,
//         strict: true,
//         deprecationErrors: true,
//     }
// });

// async function run() {
//     try {
//         // Connect the client to the server	(optional starting in v4.7)
//         await client.connect();
//         // Send a ping to confirm a successful connection
//         await client.db("admin").command({ ping: 1 });
//         console.log("Pinged your deployment. You successfully connected to MongoDB!");
//     } finally {
//         // Ensures that the client will close when you finish/error
//         await client.close();
//     }
// }
// run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Hello World 2025 september!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
