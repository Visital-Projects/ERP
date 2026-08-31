// const express = require('express');
// const router = express.Router();
// const journalEntryController = require("../controllers/journalEntry.controller");
// const auth = require("../middlewares/auth.middleware");
// const authorize = require("../middlewares/authorize");


// // ==========================
// // JOURNAL ENTRY ROUTES
// // ==========================

// // Get all journal entries
// router.get("/journal-entries", auth, authorize('manage payslip type'), journalEntryController.getAllJournalEntries);

// // Get a single journal entry by ID
// router.get("/journal-entries/:id",auth, authorize('manage payslip type'), journalEntryController.getJournalEntryById);

// // Get data for creating a new journal entry
// router.get("/journal-entries/create",auth, authorize('manage payslip type'),journalEntryController.getCreateData);

// // Create a new journal entry
// router.post("/journal-entries",auth, authorize('manage payslip type'),journalEntryController.createJournalEntry);

// // Update a journal entry
// router.put("/journal-entries/:id",auth, authorize('manage payslip type'),journalEntryController.updateJournalEntryById);

// // Delete a journal entry
// router.delete("/journal-entries/:id",auth, authorize('manage payslip type'),journalEntryController.deleteJournalEntryById);

// // Delete a single journal item
// router.delete("/journal-items/:item_id",auth, authorize('manage payslip type'),journalEntryController.deleteJournalItemById);

// module.exports = router;
