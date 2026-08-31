
// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');
const Designation = require('../models/designation.model');


// ENV VAR
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key'; // ✅ NEW

// In-memory store for refresh tokens (in production, use DB/Redis)
let refreshTokens = []; // ✅ NEW




exports.register = async (req, res) => {
  try {
    const { name, email, password, confirm_password, lang } = req.body;

    // 1. Confirm password validation
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Password and Confirm Password do not match" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Get default "company" role
    const role = await Role.findOne({ where: { name: "company" } });
    if (!role) {
      return res.status(500).json({ message: "Default role 'company' not found in roles table" });
    }

    // 5. Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      type: role.name,                 // user type = role name
      lang: lang || "en",              // default language
      created_by: 1,                // root user has no creator
    //   created_by: null,                // root user has no creator
      email_verified_at: new Date(),   // mark verified
      is_enable_login: 1,              // enabled by default
    };

    // 6. Create user
    const user = await User.create(userData);

    // 7. Assign role (pivot table) if associations exist
    if (typeof user.addRole === "function") {
      await user.addRole(role);
    } else {
      console.warn("⚠️ user.addRole not available - check User↔Role associations");
    }

    // 8. Success response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    });

  } catch (error) {
    console.error("Register Error:", error.message, error.stack); // ✅ print full error
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    

    if (user.is_enable_login === 0) {
      return res.status(403).json({ message: 'Login disabled for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      JWT_SECRET,
    //   { expiresIn: '15d' }
      { expiresIn: '3650d' } // ✅ 10 years
    );
    
    // ✅ Refresh token (NEW)
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      JWT_REFRESH_SECRET,
    //   { expiresIn: '7d' }
      { expiresIn: '3650d' } // ✅ 10 years
    );

    // ✅ Store refresh token
    refreshTokens.push(refreshToken);


    return res.json({ 
        token, 
        refreshToken, // ✅ send refresh token too
        user: { id: user.id, name: user.name, email: user.email, type: user.type } 
        
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
};



// ✅ NEW: Generate new access token from refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Invalid refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, type: decoded.type },
      JWT_SECRET,
    //   { expiresIn: '15d' }
      { expiresIn: '3650d' } // ✅ 10 years
    );

    return res.json({ token: newAccessToken });
  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};


// ✅ NEW: Logout -> remove refresh token
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  refreshTokens = refreshTokens.filter(rt => rt !== refreshToken);
  res.json({ message: "Logged out successfully" });
};




// ==============================
// GET AUTHENTICATED USER (/me)
// ==============================
// exports.getAuthenticatedUser = async (req, res) => {
//   try {
//     // `req.user` aayega JWT middleware se (id, email, type included)
//     const user = await User.findByPk(req.user.id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // ✅ find role(s) strictly matching user.type
//     const matchedRole = await Role.findOne({
//       where: { name: user.type },
//       include: [{ model: Permission, as: "permissions" }]
//     });

//     let roles = [];
//     let permissions = [];

//     if (matchedRole) {
//       roles = [{ id: matchedRole.id, name: matchedRole.name }];
//       permissions = matchedRole.permissions?.map(p => p.name) || [];
//     }

//     return res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       type: user.type,   // 🔑 keep type in sync
//       roles,
//       permissions
//     });

//   } catch (err) {
//     console.error("Get Authenticated User Error:", err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// exports.getAuthenticatedUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     let roles = [];
//     let permissions = [];

//     if (user.type === "company") {
//       // ✅ Company always sees all permissions
//       const allPermissions = await Permission.findAll();
//       roles = [{ id: 0, name: "company" }];
//       permissions = allPermissions.map(p => p.name);
//     } else {
//       // ✅ Normal user flow
//       const matchedRole = await Role.findOne({
//         where: { name: user.type },
//         include: [{ model: Permission, as: "permissions" }]
//       });

//       if (matchedRole) {
//         roles = [{ id: matchedRole.id, name: matchedRole.name }];
//         permissions = matchedRole.permissions?.map(p => p.name) || [];
//       }
//     }

//     return res.json({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       type: user.type,
//       roles,
//       permissions
//     });

//   } catch (err) {
//     console.error("Get Authenticated User Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };





exports.getAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let roles = [];
    let permissions = [];
    let branch = null;
    let employee = null; // 🟢 NEW: Include full employee info if available

    // 🟢 NEW: Check if user has an employee record (for branch info)
    const employeeRecord = await Employee.findOne({
      where: { user_id: user.id },
      include: [
        { 
          model: Branch, 
          as: 'branch', 
          attributes: ['id', 'name'] 
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: Designation,
          as: 'designation', 
          attributes: ['id', 'name']
        }
      ]
    });

    if (employeeRecord) {
      employee = {
        id: employeeRecord.id,
        employee_id: employeeRecord.employee_id,
        branch: employeeRecord.branch ? {
          id: employeeRecord.branch.id,
          name: employeeRecord.branch.name
        } : null,
        department: employeeRecord.department ? {
          id: employeeRecord.department.id,
          name: employeeRecord.department.name
        } : null,
        designation: employeeRecord.designation ? {
          id: employeeRecord.designation.id,
          name: employeeRecord.designation.name
        } : null
      };

      // Set branch for easy access
      branch = employee.branch;
    }

    if (user.type === "company") {
      // ✅ Company always sees all permissions
      const allPermissions = await Permission.findAll();
      roles = [{ id: 0, name: "company" }];
      permissions = allPermissions.map(p => p.name);
    } else {
      // ✅ Normal user flow
      const matchedRole = await Role.findOne({
        where: { name: user.type },
        include: [{ model: Permission, as: "permissions" }]
      });

      if (matchedRole) {
        roles = [{ id: matchedRole.id, name: matchedRole.name }];
        permissions = matchedRole.permissions?.map(p => p.name) || [];
      }
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      roles,
      permissions,
      branch, // 🟢 Branch information
      employee // 🟢 Full employee information (if exists)
    });

  } catch (err) {
    console.error("Get Authenticated User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, email } = req.body;

    await db('users').where({ id: user.id }).update({ name, email });

    const updatedUser = await db('users').where({ id: user.id }).first();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update profile' });
  }
};






