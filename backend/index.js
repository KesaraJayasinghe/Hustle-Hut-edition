const express = require('express')
const { connectToDatabase } = require('./database/mongoDb/db');
const { authenticateUser, getUserNamesByIds} = require('./services/AuthService');
const { getUserById, getUserAttendanceByUserId, markAttendanceIfNotExists} = require('./services/UserService');
const { getBmiByUserId, addOrUpdateBmiRecord } = require('./services/BmiService');

const app = express()
const cors = require('cors');
require('dotenv').config();
const port = 8000
// console.log("Db user name", process.env.DB_USER)
app.use(cors());
app.use(express.json())

// ADD MULTER CONFIGURATION HERE
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer to store in /uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({ storage });


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// // HustleHut-un,pw

// // hasithajayakesara- UN
// // NSvf1Y05Uejc4ezQ - PW


// // Mongo connection



const { MongoClient, ServerApiVersion ,ObjectId } = require('mongodb');
const {saveProgress, updateTrainerFeedback, getLatestProgressPerUser, getProgressByUserId, getAllProgressWithUserInfo,
    getAllProgress
} = require("./services/ProgressService");
const {router} = require("express/lib/application");
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
// POST /users/names
app.post('/users/names', async (req, res) => {
    const { idList } = req.body;

    if (!Array.isArray(idList) || idList.length === 0) {
        return res.status(400).json({ message: 'Invalid or empty ID list provided' });
    }

    try {
        const userNames = await getUserNamesByIds(idList);
        res.json({ users: userNames });
    } catch (err) {
        console.error("Failed to fetch user names:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
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

app.get('/attendance/:userId', async (req, res) => {
    try {
        const attendance = await getUserAttendanceByUserId(req.params.userId);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance not found for this user' });
        }
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

app.post('/progress', upload.array('images', 5), async (req, res) => {
    try {
        const { userId, description } = req.body;
        const images = req.files.map(file => `/uploads/${file.filename}`); // Store as URLs

        const result = await saveProgress(userId, images, description);
        res.status(201).json(result);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/progress/latest-per-user', async (req, res) => {
    try {
        const result = await getLatestProgressPerUser();
        res.status(200).json(result);
    } catch (err) {
        console.error("Error in /progress/latest-per-user:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/progress/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const result = await getProgressByUserId(userId);

        if (!result.length) {
            return res.status(404).json({ message: "No progress found for this user." });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error("Error in /progress/user/:userId:", err);
        res.status(500).json({ error: err.message });
    }
});


// Update trainer feedback
app.put('/progress/:progressId/feedback', async (req, res) => {
    try {
        const { progressId } = req.params;
        const { schedule, comments } = req.body;
        const result = await updateTrainerFeedback(progressId, schedule, comments);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all progress (simple)
app.get('/progress', async (req, res) => {
    try {
        const progress = await getAllProgress();
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all progress with user info (join)
app.get('/progress-with-users', async (req, res) => {
    try {
        const progress = await getAllProgressWithUserInfo();
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Mark attendance (if not exists)
app.post('/attendance/:userId/mark', async (req, res) => {
    try {
        const { userId } = req.params;
        const message = await markAttendanceIfNotExists(userId);
        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/progress/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const progress = await getProgressByUserId(userId);
        res.json(progress);
    } catch (err) {
        console.error("Error fetching user progress:", err);
        res.status(500).json({ message: "Failed to get progress for user" });
    }
});
