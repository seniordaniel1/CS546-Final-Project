import { userData } from '../data/index.js';
import express from 'express';
const router = express.Router();

// * Function to get user by ID
router.get("/:id", async (req, res) => {
    try {
        const user = await userData.getUserById(req.params.id);
        return res.json(user);
    } catch (e) {
        return res.status(404).json({ message: "not found!" });
    }
});

// * Get all users
router.get("/", async (req, res) => {
    try {
        const userList = await userData.getAllUsers();
        return res.json(userList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(400).send();
    }
});

// * Create a new user 
router.post("/", async (req, res) => {
    try {
        // upd = userPostData
        const upd = req.body;

        // Validate input data -- Must do it here as it will throw an error otherwise
        if (!upd.firstName || !upd.lastName || !upd.email || !upd.age || !upd.password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newUser = await userData.createUser(upd.firstName, upd.lastName, upd.email, upd.email, upd.age, upd.password);
        return res.json(newUser);
    } catch (error) {
        return res.status(400).json({ error: `User cannot be created: ${error}` });
    }
});

// * Delete an existing user 
router.delete("/:id", async (req, res) => {
    try {
        // Make sure that user exists
        await userData.getUserById(req.params.id);
        
        // Get user Id  
        const userId = req.params.id;  
        const user = await userData.removeUser(userId);
        return res.json({...user, deleted: true });
    } catch (error) {
        // If user doesnt exist, throw 404 error 
        if (error.message === "No user with that id") {
            return res.status(404).json({ message: "User not found!" }); 
        }
        return res.status(400).json({ Error: `${error.message}` });
    }
});

export default router