const Post = require('../models/post.model');

// Only handles `title` and `description` to match your model
const createPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        console.log('req.user:', req.user); // <--- Add this line

        if (!title || !description) {
            return res.status(400).json({ message: 'Please provide a title and description.' });
        }

        const post = new Post({
            title,
            description,
         
        });

        const createdPost = await post.save();
        res.status(201).json(createdPost);

    } catch (error) {
        console.error(error); // <--- Add this line
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Also simplified to only update title and description
const updatePost = async (req, res) => {
    try {
        const { title, description } = req.body; // REMOVED: role, lpa, eligibility
        const post = await Post.findById(req.params.id);

        if (post) {
            post.title = title || post.title;
            post.description = description || post.description;

            const updatedPost = await post.save();
            res.status(200).json(updatedPost);
        } else {
            res.status(404).json({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// --- No changes needed for the functions below ---

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate('postedBy') // This will include admin's email
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post) {
            await post.deleteOne();
            res.status(200).json({ message: 'Post removed successfully.' });
        } else {
            res.status(404).json({ message: 'Post not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
};