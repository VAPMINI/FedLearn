const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const {
    createProject,
    deleteProject,
    getAllProjects,
} = require('../controllers/projectController'); 

const router = express.Router();

router.post('/', authMiddleware, createProject);

router.delete('/:projectId', authMiddleware, deleteProject);

router.get('/', authMiddleware, getAllProjects);

module.exports = router;
