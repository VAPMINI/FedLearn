const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const {
    createProject,
    deleteProject,
    getAllProjects,
    updateProject,
    addCollaborator,
    uploadTestFile
} = require('../controllers/projectController'); 
const { fuzzyFindUsernames } = require('../controllers/userController');

const router = express.Router();

router.post('/', authMiddleware, createProject);

router.delete('/:projectId', authMiddleware, deleteProject);

router.get('/', authMiddleware, getAllProjects);

router.put('/:projectId', authMiddleware, updateProject);

router.post('/:projectId/collaborators', authMiddleware, addCollaborator);

router.post('/:projectId/test-file', authMiddleware, uploadTestFile);

router.get('/search/:query', authMiddleware, fuzzyFindUsernames);

module.exports = router;