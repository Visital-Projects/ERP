// routes/client.routes.js

const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/client.controller');
const auth = require('../middlewares/auth.middleware');

// Company creates a client
router.post('/', auth, ClientController.createClient);

// List clients created by company
router.get('/', auth, ClientController.getAllClients);

// Get a single client
router.get('/:id', auth, ClientController.getClientById);

// Update a client
router.put('/:id', auth, ClientController.updateClient);

// Delete a client
router.delete('/:id', auth, ClientController.deleteClient);

router.post('/login', ClientController.loginClient);

module.exports = router;
