const { ObjectId } = require('mongodb');
const { client } = require('../database/mongoDb/db');
const {getUserNamesByIds} = require("./AuthService");

/**
 * Save progress entry (now supports multiple images)
 */
async function saveProgress(userId, images, description) {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");
        const userObjectId = new ObjectId(userId);

        const progressEntry = {
            userId: userObjectId,
            images, // store array of image urls
            description,
            createdAt: new Date(),
            schedule: "",
            comments: ""
        };

        await progressCollection.insertOne(progressEntry);
        return progressEntry;

    } catch (err) {
        console.error("Error saving progress:", err);
        throw err;
    }
}

/**
 * Update trainer feedback
 */
async function updateTrainerFeedback(progressId, schedule, comments) {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");
        const filter = { _id: new ObjectId(progressId) };
        const update = {
            $set: {
                schedule,
                comments
            }
        };
        const result = await progressCollection.updateOne(filter, update);
        return result;
    } catch (err) {
        console.error("Error updating trainer feedback:", err);
        throw err;
    }
}

/**
 * Get all progress records (raw list)
 */
async function getAllProgress() {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");
        const progress = await progressCollection.find().toArray();
        return progress;
    } catch (err) {
        console.error("Error fetching all progress:", err);
        throw err;
    }
}

/**
 * Get all progress records with user info
 */
async function getAllProgressWithUserInfo() {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");
        const progress = await progressCollection.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    images: 1,
                    description: 1,
                    schedule: 1,
                    comments: 1,
                    createdAt: 1,
                    'user._id': 1,
                    'user.name': 1,
                    'user.email': 1,
                    'user.profile': 1
                }
            }
        ]).toArray();

        return progress;
    } catch (err) {
        console.error("Error fetching progress with user info:", err);
        throw err;
    }
}

/**
 * ✅ NEW: Get progress by userId
 */
async function getProgressByUserId(userId) {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");

        if (!ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID format");
        }

        const userObjectId = new ObjectId(userId);
        return await progressCollection
            .find({userId: userObjectId})
            .sort({date: -1}) // Optional: Sort by latest first
            .toArray();
    } catch (err) {
        console.error("Error fetching user progress:", err);
        throw err;
    }
}
async function getLatestProgressPerUser() {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");

        // Step 1: Get latest record for each user
        const grouped = await progressCollection.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$userId",
                    latest: { $first: "$$ROOT" }
                }
            }
        ]).toArray();

        // Step 2: Extract userIds and get their names
        const userIds = grouped.map(entry => entry._id);
        const users = await getUserNamesByIds(userIds); // returns [{ _id, name }]
        const userMap = new Map(users.map(u => [u._id, u.name]));

        // Step 3: Attach names and format results
        return grouped.map(entry => ({
            userId: entry._id.toString(),
            name: userMap.get(entry._id.toString()) || "Unknown",
            date: entry.latest.createdAt,
            schedule: entry.latest.schedule
        }));
    } catch (err) {
        console.error("Error fetching latest progress per user:", err);
        throw err;
    }
}
/**
 * ✅ NEW: Update user's own comment
 */
async function updateUserComment(progressId, newComment) {
    try {
        const progressCollection = client.db("Cluster0").collection("progress");
        const filter = { _id: new ObjectId(progressId) };
        const update = {
            $set: {
                userComment: newComment  // or replace 'comments' if reusing the same field
            }
        };
        const result = await progressCollection.updateOne(filter, update);
        return result;
    } catch (err) {
        console.error("Error updating user comment:", err);
        throw err;
    }
}

module.exports = {
    saveProgress,
    updateTrainerFeedback,
    getAllProgress,
    getAllProgressWithUserInfo,
    getProgressByUserId,
    getLatestProgressPerUser,
};
