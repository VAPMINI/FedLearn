const Project = require('../models/Project'); 
const User = require('../models/User');

const createProject = async (req, res) => {
    const { name, description, isPrivate } = req.body;
    const owner = req.username; 

    try {
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            return res.status(400).json({ message: 'Project name must be unique.' });
        }

        const user = await User.findOne({ username: owner });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newProject = new Project({
            name,
            description,
            owner: user._id,
            isPrivate
        });

        await newProject.save();
        res.status(201).json({ message: 'Project created successfully!', project: newProject });
    } catch (error) {
        res.status(400).json({ message: 'Error creating project', error });
    }
};

const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    const ownerUsername = req.username; 

    try {
        const project = await Project.findById(projectId).populate('owner');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.username !== ownerUsername) {
            return res.status(403).json({ message: 'You do not have permission to delete this project' });
        }

        await Project.findByIdAndDelete(projectId);
        res.status(200).json({ message: 'Project deleted successfully!' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting project', error });
    }
};

const getAllProjects = async (req, res) => {
    const ownerUsername = req.username;

    try {
        const user = await User.findOne({ username: ownerUsername });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const projects = await Project.find({ owner: user._id }).populate('collaborators');
        res.status(200).json({ projects });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving projects', error });
    }
};

module.exports = {
    createProject,
    deleteProject,
    getAllProjects
};
