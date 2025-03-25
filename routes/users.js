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
    // Not implemented
    res.status(501).send();
});

export default router