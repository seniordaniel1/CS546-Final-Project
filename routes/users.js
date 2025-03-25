import express from 'express';
const router = express.Router();
import { userData } from '../data/index.js';

router.get("/:id", async (req, res) => {
    try {
        const user = await userData.getUserById(req.params.id);
        return res.json(user);
    } catch (e) {
        return res.status(404).json({ message: "not found!" });
    }
});

router.get("/", async (req, res) => {
    try {
        const userList = await userData.getAllUsers();
        return res.json(userList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send();
    }
});

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

export default router