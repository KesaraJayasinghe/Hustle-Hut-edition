// db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cizd92y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        return client;
    } catch (err) {
        console.error("❌ MongoDB connection failed", err);
        throw err;
    }
}

module.exports = {
    connectToDatabase,
    client
};
