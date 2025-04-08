import { userData, postData, commentData } from '../data/index.js';
import express from 'express';
const router = express.Router();

// * Get comment by ID
router.get("/:id", async (req, res) => {
    try {
        // Validating that input is a valid user 
        const comment = await commentData.getCommentById(req.params.id);
        return res.render('getCommentById', { title: `${comment._id}`, comment: comment });
    } catch (e) {
        return res.status(404).render('404', { title: "404 Error: Comment Not found", message: "Comment not found" })
    }
});

// * Get all comments
router.get("/", async (req, res) => {
    try {
        const users = await userData.getAllUsers();
        return res.render('getAllComments', {
            title: "All users",
            users: users
        })
    } catch (e) {
        // Something went wrong with the server!
        return res.status(400).send();
    }
});

// * Get Comments by UserId
router.get('/user/:id', async (req, res) => {
    try {
        // validate userId
        const userId = req.params.id;

        if (!userId)
            return res.status(400).json({ Error: `Id input not found` });

        await userData.getUserById(userId);

        // Get all posts made by user 
        const posts = await postData.getPostsByUserId(userId);
        return res.json(posts);
    } catch (error) {
        // If user doesnt exist, throw 404 error 
        if (error.message === "No user with that id") {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(400).json({ Error: `${error.message}` });
    }
})