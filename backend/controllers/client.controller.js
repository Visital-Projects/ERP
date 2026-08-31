// controllers/client.controller.js

const User = require('../models/user.model'); // Assuming User model is defined
const Role = require('../models/role.model'); // Assuming Role model is defined
const bcrypt = require('bcryptjs');

const ClientController = {
  // Company creates client
  async createClient(req, res) {
    try {
      const { name, email, password, role_id } = req.body;
      const companyUser = req.user; // from auth middleware

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const clientUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role_id: role_id || 5, // assume 5 = client role
        created_by: companyUser.id,
        company_id: companyUser.company_id || companyUser.id,
      });

      res.status(201).json({ message: 'Client created', user: clientUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  },


  async getAllClients(req, res) {
    try {
      const companyUser = req.user;

      const clients = await User.findAll({
        where: { created_by: companyUser.id },
        include: [
          {
            model: Role,
            as: 'roles', // ✅ match the alias used in the association
            attributes: ['name'],
            through: { attributes: [] }, // Optional: exclude pivot table fields
          },
        ],
      });

      res.json(clients);
    } catch (error) {
      console.error('Client fetch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },


  // View single client
  async getClientById(req, res) {
    try {
      const client = await User.findByPk(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client not found' });

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update client
  async updateClient(req, res) {
    try {
      const { name, email } = req.body;
      const client = await User.findByPk(req.params.id);

      if (!client) return res.status(404).json({ message: 'Client not found' });

      await client.update({ name, email });
      res.json({ message: 'Client updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

 

  // Delete client
  async deleteClient(req, res) {
    try {
      const client = await User.findByPk(req.params.id);
      if (!client) return res.status(404).json({ message: 'Client not found' });

      await client.destroy();
      res.json({ message: 'Client deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  },

  async loginClient(req, res) {
    try {
      const { email, password } = req.body;

      const client = await User.findOne({ where: { email, is_client: true } });

      if (!client) return res.status(404).json({ message: 'Client not found' });

      const isMatch = await bcrypt.compare(password, client.password);

      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: client.id, role: 'client' }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({ token, client });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};



module.exports = ClientController;
