
const express = require('express');
const router = express.Router();
const noteController = require('../controllers/job_application_note.controller');
const auth = require('../middlewares/auth.middleware');

// Get all notes for a specific job application
router.get('/application/:application_id', auth, noteController.getNotesByApplicationId);

// Create a new note for a specific job application
router.post('/application/:application_id', auth, noteController.createNote);

// Delete a specific note by ID
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;

