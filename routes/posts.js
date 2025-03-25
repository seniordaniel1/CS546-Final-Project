import { postData, userData } from '../data/index.js';
import express from 'express';
const router = express.Router();

// * Create a new post
router.post("/", async (req, res) => {
    try {
        // pd = postData
        const pd = req.body;
        const userId = pd.userId;
        const content = pd.content;
        const imageUrl = pd.imageUrl;

        // Validate input data -- Must do it here as it will throw an error otherwise
        if ((!imageUrl && imageUrl !== null) || !userId || !content) {
            return res.status(400).json({ error: "All fields except imageUrl are required. If nothing is set for imageUrl, it must be set to null." });
        }

        // Validate that the userId is valid 
        await userData.getUserById(userId);

        // Create the post
        const newPost = await postData.createPost(userId, content, imageUrl);

        return res.json(newPost);
    } catch (error) {
        return res.status(400).json({ error: `User cannot be created: ${error}` });
    }
});

// * Get all posts
router.get("/", async (req, res) => {
    try {
        const postList = await postData.getAllPosts();
        return res.json(postList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(400).send();
    }
});

// * Get Posts by UserId
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

// * Get post by id 
router.get("/:id", async (req, res) => {
    try {
        const post = await postData.getPostById(req.params.id)
        return res.json(post);
    } catch (e) {
        return res.status(404).json({ message: "post not found!" });
    }
});

// * Delete an existing post 
router.delete("/:id", async (req, res) => {
    try {
        // Validate that Id is valid
        const postId = req.params.id;
        await postData.getPostById(postId)

        // Get user Id  
        const post = await postData.removePost(postId);
        return res.json({ ...post, deleted: true });
    } catch (error) {
        // If user doesnt exist, throw 404 error 
        if (error.message === "No post with that id") {
            return res.status(404).json({ message: "Post not found!" });
        }
        return res.status(400).json({ Error: `${error.message}` });
    }
});

export default router