const express = require('express');
const authMiddleware = require('../middleware/authMiddleware'); 
const {
    createProject,
    deleteProject,
    getAllProjects,
    updateProject,
    addCollaborator,
    uploadTestFile,
    getModel,
    testModel,
    contribute,
    getJson
} = require('../controllers/projectController'); 
const { fuzzyFindUsernames } = require('../controllers/userController');

const router = express.Router();

router.post('/', authMiddleware, createProject);

router.delete('/:projectId', authMiddleware, deleteProject);

router.get('/', authMiddleware, getAllProjects);

router.put('/:projectId', authMiddleware, updateProject);

router.post('/:projectId/collaborators', authMiddleware, addCollaborator);

router.post('/:projectName/test-file', authMiddleware, uploadTestFile);

router.get('/search/:query', authMiddleware, fuzzyFindUsernames);

router.get('/:projectName/model', authMiddleware, getModel);

router.post('/:projectName/test-model', authMiddleware, testModel);

router.post('/:projectName/contribute', authMiddleware, contribute);

router.get('/:projectName/json', authMiddleware, getJson);



module.exports = router;