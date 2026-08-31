const JobApplicationNote = require('../models/job_application_note.model');

// Get all notes for an application
exports.getNotesByApplicationId = async (req, res) => {
try {
const notes = await JobApplicationNote.findAll({
where: { application_id: req.params.application_id },
order: [['created_at', 'DESC']],
});
res.json(notes);
} catch (err) {
res.status(500).json({ message: 'Server error', error: err.message });
}
};

// Create a new note
exports.createNote = async (req, res) => {
try {
const { note } = req.body;

if (!note) {
    return res.status(400).json({ message: 'Note is required' });
  }
  
  const newNote = await JobApplicationNote.create({
    application_id: req.params.application_id,
    note,
    note_created: req.user.id,
    // created_by: req.user.created_by,
    created_by: req.user.created_by || req.user.id,

  });
  
  res.status(201).json(newNote);

} catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
    }
    };
    
    // Delete a note
    exports.deleteNote = async (req, res) => {
    try {
    const note = await JobApplicationNote.findByPk(req.params.id);
    if (!note) {
    return res.status(404).json({ message: 'Note not found' });
    }
    
    await note.destroy();
res.json({ message: 'Note deleted successfully' });
} catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
    }
    };