const { ObjectId } = require('mongodb');
const { client } = require('../database/mongoDb/db');

async function getBmiByUserId(userId) {
    try {
        const bmiCollection = client.db("Cluster0").collection("bmi");
        const query = { userId: new ObjectId(userId) };
        const bmiRecord = await bmiCollection.findOne(query);
        return bmiRecord;
    } catch (error) {
        console.error("Error fetching BMI record:", error);
        throw error;
    }
}

// ✅ Add or update BMI Record
async function addOrUpdateBmiRecord(bmiData) {
    try {
        const bmiCollection = client.db("Cluster0").collection("bmi");

        const userId = new ObjectId(bmiData.userId);
        const recordedAt = bmiData.recordedAt ? new Date(bmiData.recordedAt) : new Date();

        const result = await bmiCollection.updateOne(
            { userId: userId },
            {
                $set: {
                    heightCm: bmiData.heightCm,
                    weightKg: bmiData.weightKg,
                    category: bmiData.category,
                    recordedAt: recordedAt,
                },
                $push: {
                    bmi: { $each: bmiData.bmi }
                }
            },
            { upsert: true }
        );

        return result;
    } catch (error) {
        console.error("Error updating/inserting BMI record:", error);
        throw error;
    }
}

module.exports = {
    getBmiByUserId,
    addOrUpdateBmiRecord  // ✅ This must match the function name above
};
