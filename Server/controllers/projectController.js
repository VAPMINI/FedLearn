const Project = require('../models/Project'); 
const User = require('../models/User');
const Contribution = require('../models/Contribution')
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose')

const createProject = async (req, res) => {
    const { name, description, isPrivate, activation_function, dropout_rate, combining_method, input_shape, num_layers, units_per_layer } = req.body;
    const owner = req.email; 

    try {
        const existingProject = await Project.findOne({ name });
        if (existingProject) {
            return res.status(400).json({ message: 'Project name must be unique.' });
        }

        const user = await User.findOne({ email: owner });
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

        // Create project folder structure
        const userFolderPath = path.join(__dirname, '..', 'data', 'users', user.username);
        const projectFolderPath = path.join(userFolderPath, name);

        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
        }

        if (!fs.existsSync(projectFolderPath)) {
            fs.mkdirSync(projectFolderPath, { recursive: true });
        }

        // Create config.txt file
        const configContent = `
activation_function=${activation_function}
dropout_rate=${dropout_rate}
combining_method=${combining_method}
input_shape=${input_shape}
num_layers=${num_layers}
units_per_layer=${units_per_layer}
combine_latest=True
latest_model=
        `;

        fs.writeFileSync(path.join(projectFolderPath, 'config.txt'), configContent.trim());

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
    const ownerEmail = req.email;

    try {
        const user = await User.findOne({ email: ownerEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const ownedProjects = await Project.find({ owner: user._id })
            .populate('owner')
            .populate('collaborators');

        const collaboratedProjects = await Project.find({ collaborators: user._id })
            .populate('owner')
            .populate('collaborators');

        const allProjects = [...ownedProjects, ...collaboratedProjects].reduce((acc, project) => {
            if (!acc.some(p => p._id.equals(project._id))) {
                acc.push(project);
            }
            return acc;
        }, []);

        res.status(200).json({ projects: allProjects });
    } catch (error) {
        res.status(400).json({ message: 'Error retrieving projects', error });
    }
};

const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { name, description, isPrivate, activation_function, dropout_rate, combining_method, input_shape, num_layers, units_per_layer } = req.body;
    const ownerEmail = req.email;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const user = await User.findOne({ email: ownerEmail });
        if (!user || !project.owner.equals(user._id)) {
            return res.status(403).json({ message: 'Only the project owner can update the project.' });
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.isPrivate = isPrivate !== undefined ? isPrivate : project.isPrivate;
        project.activation_function = activation_function || project.activation_function;
        project.dropout_rate = dropout_rate || project.dropout_rate;
        project.combining_method = combining_method || project.combining_method;
        project.input_shape = input_shape || project.input_shape;
        project.num_layers = num_layers || project.num_layers;
        project.units_per_layer = units_per_layer || project.units_per_layer;

        await project.save();

        // Update config.txt file
        const userFolderPath = path.join(__dirname, '..', 'data', 'users', user.username);
        const projectFolderPath = path.join(userFolderPath, project.name);
        const configContent = `
activation_function=${project.activation_function}
dropout_rate=${project.dropout_rate}
combining_method=${project.combining_method}
input_shape=${project.input_shape}
num_layers=${project.num_layers}
units_per_layer=${project.units_per_layer}
combine_latest=True
latest_model=
        `;
        fs.writeFileSync(path.join(projectFolderPath, 'config.txt'), configContent.trim());

        res.status(200).json({ message: 'Project updated successfully!', project });
    } catch (error) {
        res.status(400).json({ message: 'Error updating project', error });
    }
};



const addCollaborator = async (req, res) => {
    const { username, projectName } = req.body;
    const ownerEmail = req.email;

    try {
        const user = await User.findOne({ email: ownerEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const project = await Project.findOne({ name: projectName, owner: user._id });
        if (!project) {
            console.log(projectName)
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (!project.owner.equals(user._id)) {
            return res.status(403).json({ message: 'Only the project owner can add collaborators.' });
        }

        const collaborator = await User.findOne({ username });
        if (!collaborator) {
            return res.status(404).json({ message: 'Collaborator not found.' });
        }

        if (project.collaborators.includes(collaborator._id)) {
            return res.status(400).json({ message: 'User is already a collaborator.' });
        }

        project.collaborators.push(collaborator._id);
        await project.save();

        res.status(200).json({ message: 'Collaborator added successfully!', project });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error adding collaborator', error: error.message });
    }
};

const uploadTestFile = async (req, res) => {
    const { projectId } = req.params;
    const ownerEmail = req.email;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const user = await User.findOne({ email: ownerEmail });
        if (!user || !project.owner.equals(user._id)) {
            return res.status(403).json({ message: 'Only the project owner can upload test files.' });
        }

        if (!req.files || !req.files.testFile) {
            return res.status(400).json({ message: 'No test file uploaded.' });
        }

        const testFile = req.files.testFile;
        const userFolderPath = path.join(__dirname, '..', 'data', 'users', user.username);
        const projectFolderPath = path.join(userFolderPath, project.name);
        const testFilePath = path.join(projectFolderPath, 'test');

        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
        }

        if (!fs.existsSync(projectFolderPath)) {
            fs.mkdirSync(projectFolderPath, { recursive: true });
        }

        testFile.mv(testFilePath, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error uploading test file', error: err });
            }

            res.status(200).json({ message: 'Test file uploaded successfully!' });
        });
    } catch (error) {
        res.status(400).json({ message: 'Error uploading test file', error });
    }
};

module.exports = {
    createProject,
    deleteProject,
    getAllProjects,
    updateProject,
    addCollaborator,
    uploadTestFile
};