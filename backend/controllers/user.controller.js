
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Role = require("../models/role.model");
const Branch = require("../models/branch.model");
const Department = require("../models/department.model");

const RoleUser = require("../models/roleuser.model"); 
const Employee = require('../models/employee.model');

const path = require('path');

async function resolveCompanyFromUser(userId) {
  let currentUser = await User.findOne({
    where: { id: userId },
    attributes: ["id", "type", "created_by"],
  });

  while (currentUser && currentUser.type?.toLowerCase() !== "company") {
    currentUser = await User.findOne({
      where: { id: currentUser.created_by },
      attributes: ["id", "type", "created_by"],
    });
  }

  return currentUser ? currentUser.id : null;
}


async function getCompanyId(req) {
  if (req.user?.creator_id) return req.user.creator_id;
  if (req.user?.type === 'Employee') {
    const emp = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['created_by'] });
    return emp?.created_by;
  }
  return req.user?.id;
}
function isSuper(req) {
  return (req.user?.roles || []).some(r => r.name?.toLowerCase() === 'super admin');
}

function isCompany(req) {
  return (req.user?.type || '').toLowerCase() === 'company';
}


const UserController = {
    // Create a new user
    async createUser(req, res) {
    try {
      const { name, email, password, type } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing) return res.status(400).json({ message: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ name, email, password: hashedPassword, type });

      res.status(201).json({ message: 'User created', user: newUser });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },



    // before working
    // async getAllUsers(req, res) {
    //   try {
    //     // 🧩 Step 1: Identify the company owning this user
    //     const resolveCompanyFromUser = async (userId) => {
    //       let currentUser = await User.findOne({
    //         where: { id: userId },
    //         attributes: ["id", "type", "created_by"],
    //       });
    
    //       while (currentUser && currentUser.type?.toLowerCase() !== "company") {
    //         currentUser = await User.findOne({
    //           where: { id: currentUser.created_by },
    //           attributes: ["id", "type", "created_by"],
    //         });
    //       }
    
    //       return currentUser ? currentUser.id : null;
    //     };
    
    //     const companyId = await resolveCompanyFromUser(req.user.id);
    //     if (!companyId)
    //       return res.status(403).json({ message: "Unable to determine company ownership" });
    
    //     // 🧩 Step 2: Determine access scope
    //     let userWhere = {};
    
    //     if (req.user.type === "company") {
    //       // ✅ Company: get all users created by company or any sub-user (recursive)
    //       const allUserIds = await User.findAll({
    //         where: { created_by: companyId },
    //         attributes: ["id"],
    //       });
    //       const subUserIds = allUserIds.map((u) => u.id);
    
    //       userWhere = {
    //         [Op.or]: [
    //           { id: companyId }, // include company itself
    //           { created_by: companyId },
    //           { created_by: subUserIds.length ? subUserIds : null },
    //         ],
    //       };
    //     } else {
    //       // ✅ Role or branch-bound user: get only users created by this user or same company
    //       userWhere = {
    //         [Op.or]: [
    //           { created_by: req.user.id },
    //           { created_by: companyId },
    //         ],
    //       };
    //     }
    
    //     // 🧩 Step 3: Fetch users with attributes
    //     const users = await User.findAll({
    //       where: userWhere,
    //       attributes: {
    //         exclude: ["password"],
    //         include: ["created_at", "updated_at"],
    //       },
    //       order: [["id", "DESC"]],
    //     });
    
    //     // 🧩 Step 4: Response
    //     res.json({ success: true, data: users });
    //   } catch (err) {
    //     console.error("❌ Get All Users Error:", err);
    //     res.status(500).json({ message: "Server error", error: err.message });
    //   }
    // },


    //after chnage it working
    async getAllUsers(req, res) {
      try {
        // Only company can fetch all users
        if (!req.user || req.user.type.toLowerCase() !== 'company') {
          return res.status(403).json({ success: false, message: 'Only company can access all users' });
        }
        
        // Pagination query params
        // let page = parseInt(req.query.page) || 1; // default page 1
        // let limit = parseInt(req.query.limit) || 10; // default 10 users per page
        // if (page < 1) page = 1;
    
        // const offset = (page - 1) * limit;
    
        // Fetch total users count
        const totalUsers = await User.count();
    
        // Fetch all users in the table
        const users = await User.findAll({
          attributes: { exclude: ['password'], include: ['created_at', 'updated_at'] },
          order: [['id', 'DESC']], // or DESC if you want latest first
        //   limit,
        //   offset,
    
        });
    
            return res.json({ success: true, /*page, limit, total: totalUsers, totalPages: Math.ceil(totalUsers / limit),*/ data: users });
        } catch (err) {
        console.error("Get All Users Error:", err);
        return res.status(500).json({ success: false, message: 'Server error', error: err.message });
      }
    },


    // 🔹 Additional methods (example: get user by ID)
    async getUserById(req, res) {
    try {
      const user = await User.findOne({
        where: { id: req.params.id },
        attributes: { exclude: ["password"] },
      });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, data: user });
    } catch (err) {
      console.error("❌ Get User By ID Error:", err);
      res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
  },





    async checkUserExists(req, res) {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
      const user = await User.findOne({ where: { email } });
      return res.json({ exists: !!user });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },

    async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: {
          exclude: ['password'],
          include: ['created_at', 'updated_at']
        }
      });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },




    // updateUser: async (req, res) => {
    //   try {
    //     const companyId = await getCompanyId(req);
    
    //     const where = isSuper(req)
    //       ? { id: req.params.id }
    //       : { id: req.params.id};
    
    //     const user = await User.findOne({ where });
    //     if (!user) {
    //       return res.status(404).json({ message: 'User not found or not in your company scope' });
    //     }
    
    //     const { name, email, type, is_active } = req.body;
    
    //     // Handle avatar upload
    //     let avatarPath = user.avatar;
    //     if (req.file) {
    //       avatarPath = path.join('uploads', 'avatars', req.file.filename);
    //     }
    
    //     // ✅ If type is a role id → resolve to role name
    //     let roleName = user.type;
    //     if (type) {
    //       const role = await Role.findByPk(type);
    //       if (!role) {
    //         return res.status(400).json({ message: 'Invalid role id' });
    //       }
    //       roleName = role.name; // store role name instead of id
    //     }
    
    //     await user.update({
    //       name: name ?? user.name,
    //       email: email ?? user.email,
    //       type: roleName,
    //       is_active: is_active !== undefined ? is_active : user.is_active,
    //       avatar: avatarPath,
    //     });
        
    
    //     const { password, ...safeUser } = user.toJSON();
    
    //     res.json({ success: true, message: 'User updated', data: safeUser });
    //   } catch (err) {
    //     console.error('❌ Update User Error:', err);
    //     res.status(500).json({ message: 'Server error', error: err.message });
    //   }
    // },
        updateUser: async (req, res) => {
          try {
            const companyId = await getCompanyId(req);
        
            const where = isSuper(req)
              ? { id: req.params.id }
              : { id: req.params.id};
        
            const user = await User.findOne({ where });
            if (!user) {
              return res.status(404).json({ message: 'User not found or not in your company scope' });
            }
        
            const { name, email, type, is_active } = req.body;
        
            // Handle avatar upload
            let avatarPath = user.avatar;
            if (req.file) {
              avatarPath = path.join('uploads', 'avatars', req.file.filename);
            }
        
            // ✅ If type is a role id → resolve to role name
            let roleName = user.type;
            if (type) {
              const role = await Role.findByPk(type);
              if (!role) {
                return res.status(400).json({ message: 'Invalid role id' });
              }
              roleName = role.name; // store role name instead of id
            }
        
            // ============================================================
            // 🔥🔥🔥 HIGHLIGHTED AREA START: SYNC is_active STATUS WITH EMPLOYEE TABLE
            // ============================================================
            
            // Check if is_active status is being changed
            const isActiveChanging = is_active !== undefined && is_active !== user.is_active;
            
            // Update user first
            await user.update({
              name: name ?? user.name,
              email: email ?? user.email,
              type: roleName,
              is_active: is_active !== undefined ? is_active : user.is_active,
              avatar: avatarPath,
            });
            
            // If is_active status changed, sync with employee record
            if (isActiveChanging) {
              try {
                console.log(`🔄 Syncing is_active status to employee record...`);
                console.log(`🔍 User ID: ${user.id}, New is_active: ${is_active}`);
                
                // Find employee record linked to this user
                const employeeRecord = await Employee.findOne({
                  where: { user_id: user.id }
                });
                
                if (employeeRecord) {
                  // Update employee's is_active status to match user
                  await Employee.update(
                    { 
                      is_active: is_active,
                      updated_at: new Date()
                    },
                    { 
                      where: { 
                        user_id: user.id 
                      } 
                    }
                  );
                  console.log(`✅ Employee is_active status synced to: ${is_active}`);
                } else {
                  console.log('ℹ️ No employee record found for this user, skipping employee sync');
                }
              } catch (syncError) {
                console.error('❌ Error syncing is_active status to employee:', syncError);
                // Don't return error here - just log it, as user update was successful
              }
            }
            
            // ============================================================
            // 🔥🔥🔥 HIGHLIGHTED AREA END
            // ============================================================
    
            const { password, ...safeUser } = user.toJSON();
    
            res.json({ 
              success: true, 
              message: isActiveChanging 
                ? 'User updated and employee status synced' 
                : 'User updated', 
              data: safeUser 
            });
          } catch (err) {
            console.error('❌ Update User Error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
          }
    },






 
    async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // validate inputs
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Old, new, and confirm password are required' });
      }

      // check if new and confirm match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
      }

      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      // verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect' });
      }

      // hash and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change Password Error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },


    async deleteUser(req, res) {
    try {
      await User.destroy({ where: { id: req.params.id } });
      res.json({ message: 'User deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  },

    async getUserInfoByType(req, res) {
    const { id, type } = req.params;
    try {
      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email', 'created_at']
      });
      if (!user) return res.status(404).json({ message: 'User not found' });

      let data = {};
      if (type === 'basic') {
        data = {
          name: user.name,
          email: user.email,
          created_at: user.created_at
        };
      } else {
        data = { message: `Info type '${type}' not supported yet.` };
      }

      return res.json({ user: user.toJSON(), data });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

    async searchUsers(req, res) {
    const { term } = req.query;
    if (!term) return res.status(400).json({ message: 'Search term is required' });

    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${term}%` } },
            { email: { [Op.like]: `%${term}%` } }
          ]
        },
        attributes: ['id', 'name', 'email']
      });

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error });
    }
  },

    async changeUserMode(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const newMode = user.mode === 'dark' ? 'light' : 'dark';
      user.mode = newMode;
      await user.save();

      return res.json({ message: `Mode changed to ${newMode}`, mode: newMode });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

    
    // // ✅ UPDATED AREA — FIXED toggleLoginStatus
    // async toggleLoginStatus(req, res) {
    //   try {
    //     const companyId = await getCompanyId(req);
    //     let user;
    
    //     if (isSuper(req)) {
    //       user = await User.findOne({ where: { id: req.params.id } });
    //     } else if (isCompany(req)) {
    //       const directUsers = await User.findAll({
    //         where: { created_by: companyId },
    //         attributes: ['id'],
    //         raw: true
    //       });
    //       const directUserIds = directUsers.map(u => Number(u.id));
    //       const allowedUserIds = [Number(companyId), ...directUserIds];
    
    //       user = await User.findOne({
    //         where: { id: req.params.id, id: { [Op.in]: allowedUserIds } }
    //       });
    //     } else {
    //       return res.status(403).json({ message: 'Forbidden: branch users cannot change login status' });
    //     }
    
    //     if (!user) {
    //       return res.status(404).json({ message: 'User not found or not in your company scope' });
    //     }
    
    //     // ✅ Ensure it's a Sequelize instance
    //     if (!(user instanceof User)) {
    //       user = await User.findByPk(user.id);
    //     }
    
    //     // 🔒 **PROTECTION ADDED HERE**
    //     // Prevent disabling company login permanently
    //     if (user.type && user.type.toLowerCase() === 'company') {
    //       return res.status(400).json({
    //         success: false,
    //         message: 'You cannot disable login for company accounts.'
    //       });
    //     }
    //     // 🔒 **END PROTECTION**
    
    //     // ✅ Toggle & save
    //     user.is_enable_login = user.is_enable_login ? 0 : 1;
    //     await user.save({ fields: ['is_enable_login'] });
    
    //     res.json({
    //       success: true,
    //       message: `Login status changed successfully`,
    //       is_enable_login: user.is_enable_login
    //     });
    //   } catch (err) {
    //     console.error('❌ Toggle Login Status Error:', err);
    //     res.status(500).json({ message: 'Server error', error: err.message });
    //   }
    // },


    async filterUserView(req, res) {
    try {
      const { role, branch, department } = req.query;

      const where = {};
      const include = [];

      if (role) {
        include.push({
          model: Role,
          where: { name: { [Op.like]: `%${role}%` } },
          attributes: ['id', 'name']
        });
      } else {
        include.push({ model: Role, attributes: ['id', 'name'] });
      }

      if (branch) {
        include.push({
          model: Branch,
          where: {
            [Op.or]: [
              { id: isNaN(branch) ? undefined : Number(branch) },
              { name: { [Op.like]: `%${branch}%` } }
            ]
          },
          attributes: ['id', 'name']
        });
      } else {
        include.push({ model: Branch, attributes: ['id', 'name'] });
      }

      if (department) {
        include.push({
          model: Department,
          where: {
            [Op.or]: [
              { id: isNaN(department) ? undefined : Number(department) },
              { name: { [Op.like]: `%${department}%` } }
            ]
          },
          attributes: ['id', 'name']
        });
      } else {
        include.push({ model: Department, attributes: ['id', 'name'] });
      }

      const users = await User.findAll({
        where,
        include,
        order: [['id', 'DESC']]
      });

      res.json(users);
    } catch (error) {
      console.error('Filter User View Error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
    //--------------------------------------------------------------------
  
    async addUser(req, res) {
      try {
        const { name, email, password, role_id } = req.body;
    
        // 🧱 Validate required fields
        if (!name || !email || !password || !role_id) {
          return res.status(400).json({ message: 'All fields are required' });
        }
    
        // 🚫 Check if email already exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          return res.status(400).json({ message: 'Email already exists' });
        }
    
        // 🏢 Identify company creating this user
        const companyId = await getCompanyId(req);
    
        // 🧩 Fetch role and validate
        const role = await Role.findByPk(role_id);
        if (!role) {
          return res.status(400).json({ message: 'Invalid role id' });
        }
    
        // 🔐 Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // 🧍 Create user record
        const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          type: role.name,      // store role name for easy display
          created_by: companyId // link this user to the company
        });
    
        // 🔗 Link user to the role in pivot table
        await RoleUser.create({
          role_id: role.id,
          model_type: 'App\\Models\\User',
          model_id: newUser.id
        });
    
        // ✅ Success response
        res.status(201).json({
          success: true,
          message: 'User added successfully',
          user: newUser
        });
      } catch (err) {
        console.error('❌ Add User Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    }
    
    // async addUser(req, res) {
    //   try {
    //     const { name, email, password, role_id, branch_id } = req.body; // <-- add branch_id
    
    //     if (!name || !email || !password || !role_id) {
    //       return res.status(400).json({ message: 'All fields are required' });
    //     }
    
    //     const existing = await User.findOne({ where: { email } });
    //     if (existing) {
    //       return res.status(400).json({ message: 'Email already exists' });
    //     }
    
    //     const companyId = await getCompanyId(req);
    
    //     const role = await Role.findByPk(role_id);
    //     if (!role) {
    //       return res.status(400).json({ message: 'Invalid role id' });
    //     }
    
    //     const hashedPassword = await bcrypt.hash(password, 10);
    
    //     // Create user
    //     const newUser = await User.create({
    //       name,
    //       email,
    //       password: hashedPassword,
    //       type: role.name,
    //       created_by: companyId, // always link to company
    //     });
    
    //     // Assign role
    //     await RoleUser.create({
    //       role_id: role.id,
    //       model_type: 'App\\Models\\User',
    //       model_id: newUser.id
    //     });
    
    //     // ✅ Optional: create employee record if branch_id provided
    //     if (branch_id) {
    //       await Employee.create({
    //         user_id: newUser.id,
    //         branch_id,             // assign branch
    //         created_by: companyId, // link to company
    //         is_active: 1,          // active by default
    //         name,
    //         email
    //       });
    //     }
    
    //     return res.status(201).json({
    //       success: true,
    //       message: 'User added successfully',
    //       user: newUser
    //     });
    //   } catch (err) {
    //     console.error('❌ Add User Error:', err);
    //     return res.status(500).json({ message: 'Server error', error: err.message });
    //   }
    // }

  //--------------------------------------------------------------------
  
};

module.exports = UserController;
