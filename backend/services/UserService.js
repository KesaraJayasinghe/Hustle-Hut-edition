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
async function markAttendanceIfNotExists(userId) {
    try {
        const attendanceCollection = client.db("Cluster0").collection("attendance");
        const userObjectId = new ObjectId(userId);

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayDate = today.toISOString().split('T')[0];

        // Check if attendance document exists for this user
        const userAttendanceDoc = await attendanceCollection.findOne({ userId: userObjectId });

        // If user has no attendance document, create new document
        if (!userAttendanceDoc) {
            const newAttendance = {
                date: todayDate,
                status: "Present",
                checkIn: today.toTimeString().slice(0, 5),
                checkOut: null
            };

            const summary = {
                totalDays: 1,
                present: 1,
                late: 0,
                absent: 0
            };

            await attendanceCollection.insertOne({
                userId: userObjectId,
                attendance: [newAttendance],
                summary,
                recordedAt: new Date()
            });

            return "Attendance document created and attendance marked.";
        }

        // Check if today’s attendance record already exists
        const alreadyMarked = userAttendanceDoc.attendance.some(
            (record) => record.date === todayDate
        );

        if (alreadyMarked) {
            return "Attendance already marked for today.";
        }

        // If not marked for today, add new attendance entry
        const newAttendance = {
            date: todayDate,
            status: "Present",
            checkIn: today.toTimeString().slice(0, 5),
            checkOut: null
        };

        await attendanceCollection.updateOne(
            { userId: userObjectId },
            { $push: { attendance: newAttendance } }
        );

        // You can also update summary if you want (optional)
        await attendanceCollection.updateOne(
            { userId: userObjectId },
            {
                $inc: {
                    "summary.totalDays": 1,
                    "summary.present": 1
                }
            }
        );

        return "Attendance marked for today.";

    } catch (err) {
        console.error("Error marking attendance:", err);
        throw err;
    }
}

module.exports = {
    getUserById,
    getUserAttendanceByUserId,
    markAttendanceIfNotExists
};
