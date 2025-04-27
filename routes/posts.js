import { postData, userData, commentData } from '../data/index.js';
import express from 'express';
import { addUserJsonToInput, getUserJsonsFromUserIds } from '../helpers.js';
const router = express.Router();

// * Get all posts
router.get("/", async (req, res) => {
    try {
        const postList = await postData.getAllPosts();
        return res.render("getAllPosts", {
          title: "All Posts",
          posts: postList,
        });
        //return res.json(postList);
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
        const tmpPost = await postData.getPostById(req.params.id)
        const posts = await addUserJsonToInput([tmpPost], "getPostById-post");
        const post = posts[0];

        const tmpComments = await commentData.getCommentsByPostId(post._id);
        const comments = await addUserJsonToInput(tmpComments, "getPostById-comments");
        comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const likes = await getUserJsonsFromUserIds(post.likes, "getPostById-userLikes");
        const dislikes = await getUserJsonsFromUserIds(post.dislikes, "getPostById-userLikes");
        const likeScore = likes.length - dislikes.length
        return res.render('getPostById', {
            title: "Insert post title here",
            post: post,
            comments: comments,
            likes: likes,
            dislikes: dislikes,
            likeScore: likeScore
        })
    } catch (e) {
        return res.status(404).render('error', { title: "404 Error: Post Not found", message: "Post not found" + e })
    }
});

// * Get likes by id
router.get('/:id/likes', async (req, res) => {
    try {
        // Get current post 
        const tmpPost = await postData.getPostById(req.params.id)

        // Get Current user
        const tmpCurrUser = await getUserJsonsFromUserIds([tmpPost.userId], "getPostLikes-currUser")
        const currUser = tmpCurrUser[0];

        // Get JSON List of users who liked the post 
        const userLikes = await getUserJsonsFromUserIds(tmpPost.likes, "getPostLikes-userLikes")
        return res.render('(dis)likes.handlebars', {
            listType: "Likes",
            list: userLikes,
            user: currUser,
            title: `${currUser.username} Like List`
        })
    } catch (error) {
        return res.status(400).render('400', { title: "400 Error: Something went wrong", message: "Post not found" + error })
    }
})

// * Get dislikes by id
router.get('/:id/dislikes', async (req, res) => {
    try {
        // Get current post 
        const tmpPost = await postData.getPostById(req.params.id)

        // Get Current user
        const tmpCurrUser = await getUserJsonsFromUserIds([tmpPost.userId], "getPostDislikes-currUser")
        const currUser = tmpCurrUser[0];

        // Get JSON List of users who liked the post 
        const userDisLikes = await getUserJsonsFromUserIds(tmpPost.dislikes, "getPostDislikes-userLikes")
        return res.render('(dis)likes.handlebars', {
            listType: "Dislikes",
            list: userDisLikes,
            user: currUser,
            title: `${currUser.username} Dislike List`
        })
    } catch (error) {
        return res.status(400).render('400', { title: "400 Error: Something went wrong", message: "Post not found" + error })
    }
})

export default router