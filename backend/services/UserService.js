// services/userService.js
const { ObjectId } = require('mongodb');
const { client } = require('../database/mongoDb/db');

/**
 * Get a user document by ID.
 * @param {string} userId
 * @returns {Object|null}
 */
async function getUserById(userId) {
    try {
        const userCollection = client.db("Cluster0").collection("users");
        const query = { _id: new ObjectId(userId) };
        const user = await userCollection.findOne(query);
        return user;
    } catch (err) {
        console.error("Error fetching user by ID:", err);
        throw err;
    }
}

/**
 * Get attendance data for a given userId.
 * @param {string} userId
 * @returns {Object|null} The attendance document
 */
async function getUserAttendanceByUserId(userId) {
    try {
        const attendanceCollection = client.db("Cluster0").collection("attendance");
        const query = { userId: new ObjectId(userId) };
        const attendance = await attendanceCollection.findOne(query);
        return attendance;
    } catch (err) {
        console.error("Error fetching attendance by userId:", err);
        throw err;
    }
}

module.exports = {
    getUserById,
    getUserAttendanceByUserId
};
