// import postRoutes from './posts.js';
import userRoutes from './users.js';
// import commentRoutes from "./comments.js"

const constructorMethod = (app) => {
    // app.use('/posts', postRoutes);
    app.use('/users', userRoutes);
    // app.use('/comments', commentRoutes)

    app.use('*', (req, res) => {
        return res.status(404).json({ error: 'Route not found' });
    });
};

export default constructorMethod;