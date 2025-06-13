const express = require('express')
const { connectToDatabase } = require('./database/mongoDb/db');
const { authenticateUser } = require('./services/AuthService');
const { getUserById } = require('./services/UserService');
const { getBmiByUserId, addOrUpdateBmiRecord } = require('./services/BmiService');

const app = express()
const cors = require('cors');
require('dotenv').config();
const port = 8000
// console.log("Db user name", process.env.DB_USER)
app.use(cors());
app.use(express.json())



// // HustleHut-un,pw

// // hasithajayakesara- UN
// // NSvf1Y05Uejc4ezQ - PW


// // Mongo connection



const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
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

        app.get('/classes', async (req, res) => {
            const query = { status: 'approved' };
            const result = await classesCollections.find().toArray();
            res.send(result);
        })


        //get classes by instructoers email


        app.get('/classes/:email', async (req, res) => {
            const email = req.params.email;
            const query = { instructorEmail: email };
            const result = await classesCollections.find(query).toArray();
            res.send(result);
        });




//manage classes

app.get('/classes-manage', async (req, res) => {

const result = await classesCollections.find().toArray();
res.send(result);
    })


//update classess status and reson

app.patch('/change-status/:id',async(req,res) =>{

const id = req.params.id;
const status = req.body.status;
const reason = req.body.reason;
const filter = {_id:new ObjectId(id)};
const options ={upsert: true};
const updateDoc = {

    $set:{
        status: status,
        reason: reason,
    },
};
const result = await classesCollections.updateOne(filter,updateDoc,options);
res.send(result);

});





//get approved classes


app.get('/approved-classes', async(req,res)=>{

    const query = { status: 'approved' };
    const result = await classesCollection.find(query).toArray();
    res.send(result);

});


//get signal class details 

app.get('/class/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await classesCollections.findOne(query); // ✅ use correct variable
    res.send(result);
});



//update class details all data


app.put('/update-class/:id', async (req, res) => {
    const id = req.params.id;
    const updateClass = req.body;
    const filter = {_id: new ObjectId(id)};
    const options = { upsert: true };
    const updateDoc = {
    $set: {
    name: updateClass.name,
    description: updateClass.description,
    price: updateClass.price,
    availableSeats: parseInt(updateClass.availableSeats),
    videoLink: updateClass.videoLink,
    status: 'pending',
    }
    };
    const result = await classesCollections.updateOne(filter, updateDoc, options);
    res.send(result);

    });



//cart routes 


app.post('/add-to-cart', async (req, res) =>{
    const newCartItem = req.body;
    const result = await cartCollections.insertOne(newCartItem);
    res.send(result);

    });


//get cart items by id 



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
// ✅ LOGIN route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await authenticateUser(email, password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful', user });
});

// ✅ GET User by ID
app.get('/user/:id', async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).send({ message: 'User not found' });
    res.send(user);
});

// ✅ GET BMI by User ID
app.get('/bmi/:userId', async (req, res) => {
    const bmi = await getBmiByUserId(req.params.userId);
    if (!bmi) return res.status(404).send({ message: 'BMI not found' });
    res.send(bmi);
});
app.post('/bmi', async (req, res) => {
    try {
        const bmiData = req.body;
        const result = await addOrUpdateBmiRecord(bmiData);
        res.status(201).json({ message: 'BMI record added', insertedId: result.insertedId });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add BMI record', error: error.message });
    }
});


