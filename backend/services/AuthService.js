// services/authService.js
const bcrypt = require('bcrypt');
const { client } = require('../database/mongoDb/db');
const {ObjectId} = require("mongodb");

/**
 * Authenticates a user by email and password.
 * @param {string} email - User's email address.
 * @param {string} password - Plain text password to validate.
 * @returns {Object|null} The user object if valid, or null if invalid.
 */
async function authenticateUser(email, password) {
    try {
        const userCollection = client.db("Cluster0").collection("user");
        const user = await userCollection.findOne({ email });
        if (!user) {
            return null; // No user with this email
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password); //salt is 10
        // hasitha.jayakesara@example.com
        // test123
        if (!isPasswordMatch) {
            return null; // Password didn't match
        }

        return user; // Valid credentials
    } catch (err) {
        console.error("Error authenticating user:", err);
        throw err;
    }
}
async function getUserNamesByIds(idList) {
    try {
        const userCollection = client.db("Cluster0").collection("user");
        const objectIds = idList.map(id => new ObjectId(id));

        const users = await userCollection.find(
            { _id: { $in: objectIds } },
            { projection: { name: 1 } }
        ).toArray();

        return users.map(user => ({ _id: user._id.toString(), name: user.name }));
    } catch (err) {
        console.error("Error fetching user names by IDs:", err);
        throw err;
    }
}
module.exports = {
    authenticateUser,
    getUserNamesByIds
};
