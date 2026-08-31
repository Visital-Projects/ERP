
// const xlsx = require("xlsx");
// const mysql = require("mysql2/promise");
// const bcrypt = require("bcryptjs");
// require("dotenv").config();

// // ✅ MySQL Pool (Production Safe)
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// // Helper function to convert Excel serial date to MySQL date format
// function excelDateToJSDate(serial) {
//   if (!serial) return null;
  
//   // Excel's epoch is 1900-01-01
//   // Excel incorrectly treats 1900 as a leap year, so we need to adjust
//   const utc_days = Math.floor(serial - 25569);
//   const utc_value = utc_days * 86400;
//   const date_info = new Date(utc_value * 1000);
  
//   // Handle invalid dates
//   if (isNaN(date_info.getTime())) return null;
  
//   // Format as YYYY-MM-DD
//   const year = date_info.getFullYear();
//   const month = String(date_info.getMonth() + 1).padStart(2, '0');
//   const day = String(date_info.getDate()).padStart(2, '0');
  
//   return `${year}-${month}-${day}`;
// }

// // Helper function to parse any date format
// function parseDate(dateValue) {
//   if (!dateValue) return null;
  
//   // If it's a number (Excel serial date)
//   if (typeof dateValue === 'number') {
//     return excelDateToJSDate(dateValue);
//   }
  
//   // If it's already a string
//   if (typeof dateValue === 'string') {
//     // Remove time part if present (like "2003-12-02 00:00:00")
//     const datePart = dateValue.split(' ')[0];
    
//     // Check if it's a valid date
//     const date = new Date(datePart);
//     if (!isNaN(date.getTime())) {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day}`;
//     }
//   }
  
//   return null;
// }

// exports.uploadExcel = async (req, res) => {
//   let connection;

//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "No file uploaded",
//       });
//     }

//     connection = await pool.getConnection();
//     await connection.beginTransaction();

//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//     if (!data.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Excel file is empty",
//       });
//     }

//     for (const row of data) {
//       // ===============================
//       // 🔹 SANITIZE VALUES (IMPORTANT)
//       // ===============================

//       // Parse dates properly
//       const dob = parseDate(row.DOB);
//       const companyDoj = parseDate(row.CompanyDOJ);
//       const createdAt = parseDate(row.CreatedAt) || new Date().toISOString().split('T')[0];
//       const updatedAt = parseDate(row.UpdatedAt) || new Date().toISOString().split('T')[0];
//       const deletedAt = parseDate(row.DeletedAt);

//       const isActive = row.IsActive !== undefined && row.IsActive !== null && row.IsActive !== ""
//         ? parseInt(row.IsActive, 10)
//         : 1;

//       const salary = row.Salary !== undefined && row.Salary !== null && row.Salary !== ""
//         ? parseFloat(row.Salary)
//         : 0;

//       const branchId = row.BranchID !== "" && row.BranchID != null
//         ? parseInt(row.BranchID, 10)
//         : null;

//       const departmentId = row.DepartmentID !== "" && row.DepartmentID != null
//         ? parseInt(row.DepartmentID, 10)
//         : null;

//       const designationId = row.DesignationID !== "" && row.DesignationID != null
//         ? parseInt(row.DesignationID, 10)
//         : null;

//       // 🔐 Password Hash
//       let password = row.Password || "password123";
//       if (!password.startsWith("$2b$")) {
//         password = await bcrypt.hash(password, 10);
//       }

//       // ===============================
//       // 1️⃣ USERS TABLE
//       // ===============================
//       const [existingUser] = await connection.query(
//         "SELECT id FROM users WHERE email = ? LIMIT 1",
//         [row.Email]
//       );

//       let userId;

//       if (existingUser.length > 0) {
//         userId = existingUser[0].id;

//         await connection.query(
//           `UPDATE users 
//           SET name=?, password=?, type=?, is_active=?, updated_at=? 
//           WHERE id=?`,
//           [
//             row.Name,
//             password,
//             "employee",
//             isActive,
//             updatedAt, // Use parsed date
//             userId,
//           ]
//         );
//       } else {
//         const [userResult] = await connection.query(
//           `INSERT INTO users 
//           (name, email, password, type, is_active, created_by, created_at, updated_at) 
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//           [
//             row.Name,
//             row.Email,
//             password,
//             "employee",
//             isActive,
//             row.CreatedBy || 116,
//             createdAt, // Use parsed date
//             updatedAt, // Use parsed date
//           ]
//         );

//         userId = userResult.insertId;
//       }

//       // ===============================
//       // 2️⃣ SALARY TYPE LOOKUP
//       // ===============================
//       let salaryTypeId = null;

//       if (row.SalaryType && row.SalaryType !== "") {
//         if (!isNaN(row.SalaryType)) {
//           salaryTypeId = parseInt(row.SalaryType, 10);
//         } else {
//           const [rows] = await connection.query(
//             "SELECT id FROM payslip_types WHERE LOWER(name) = ? LIMIT 1",
//             [row.SalaryType.toLowerCase()]
//           );

//           if (rows.length) {
//             salaryTypeId = rows[0].id;
//           }
//         }
//       }

//       // ===============================
//       // 3️⃣ EMPLOYEES TABLE
//       // ===============================
      
//       // Handle Skills - check both column names
//       const skills = row.Skills || row.Skill || row.skills || null;

//       await connection.query(
//         `INSERT INTO employees 
//           (user_id, name, dob, gender, phone, address, email, password, employee_id, biometric_emp_id,
//           branch_id, department_id, designation_id, company_doj, documents, account_holder_name,
//           account_number, bank_name, bank_identifier_code, branch_location, tax_payer_id,
//           salary_type, salary, is_active, created_by, created_at, updated_at,
//           aadhaar_number, employee_type, deleted_at, rejoin_reason, uan_number, ip_number, father_name, skill_id)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//          ON DUPLICATE KEY UPDATE 
//           name=VALUES(name), dob=VALUES(dob), gender=VALUES(gender),
//           phone=VALUES(phone), address=VALUES(address),
//           email=VALUES(email), password=VALUES(password),
//           biometric_emp_id=VALUES(biometric_emp_id),
//           branch_id=VALUES(branch_id),
//           department_id=VALUES(department_id),
//           designation_id=VALUES(designation_id),
//           company_doj=VALUES(company_doj),
//           documents=VALUES(documents),
//           account_holder_name=VALUES(account_holder_name),
//           account_number=VALUES(account_number),
//           bank_name=VALUES(bank_name),
//           bank_identifier_code=VALUES(bank_identifier_code),
//           branch_location=VALUES(branch_location),
//           tax_payer_id=VALUES(tax_payer_id),
//           salary_type=VALUES(salary_type),
//           salary=VALUES(salary),
//           is_active=VALUES(is_active),
//           updated_at=VALUES(updated_at),
//           aadhaar_number=VALUES(aadhaar_number),
//           employee_type=VALUES(employee_type),
//           deleted_at=VALUES(deleted_at),
//           rejoin_reason=VALUES(rejoin_reason),
//           uan_number=VALUES(uan_number),
//           ip_number=VALUES(ip_number),
//           father_name=VALUES(father_name),
//           skill_id=VALUES(skill_id)`,
//         [
//           userId,
//           row.Name,
//           dob, // Use parsed date
//           row.Gender || null,
//           row.Phone ? row.Phone.toString() : null,
//           row.Address || null,
//           row.Email,
//           password,
//           row.EmployeeID ? row.EmployeeID.toString() : null,
//           row.BiometricEmpID ? row.BiometricEmpID.toString() : null,
//           branchId,
//           departmentId,
//           designationId,
//           companyDoj, // Use parsed date
//           row.Documents || null,
//           row.AccountHolderName || null,
//           row.AccountNumber ? row.AccountNumber.toString() : null,
//           row.BankName || null,
//           row.BankIdentifierCode || null,
//           row.BranchLocation || null,
//           row.TaxPayerID ? row.TaxPayerID.toString() : null,
//           salaryTypeId,
//           salary,
//           isActive,
//           row.CreatedBy || 116,
//           createdAt, // Use parsed date
//           updatedAt, // Use parsed date
//           row.AadhaarNumber ? row.AadhaarNumber.toString() : null,
//           row.EmployeeType || null,
//           deletedAt, // Use parsed date
//           row.RejoinReason || null,
//           row.UANNumber ? row.UANNumber.toString() : null,
//           row.IPNumber ? row.IPNumber.toString() : null,
//           row.FatherName || null,
//           skills, // Use the skills variable
//         ]
//       );
//     }

//     await connection.commit();

//     res.json({
//       success: true,
//       message: "Excel uploaded & employees imported successfully",
//     });

//   } catch (error) {
//     if (connection) await connection.rollback();
//     console.error("Upload error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// };






const xlsx = require("xlsx");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// ✅ MySQL Pool (Production Safe)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper function to convert Excel serial date to MySQL date format
function excelDateToJSDate(serial) {
  if (!serial) return null;
  
  // Excel's epoch is 1900-01-01
  // Excel incorrectly treats 1900 as a leap year, so we need to adjust
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  
  // Handle invalid dates
  if (isNaN(date_info.getTime())) return null;
  
  // Format as YYYY-MM-DD
  const year = date_info.getFullYear();
  const month = String(date_info.getMonth() + 1).padStart(2, '0');
  const day = String(date_info.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Helper function to parse any date format
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's a number (Excel serial date)
  if (typeof dateValue === 'number') {
    return excelDateToJSDate(dateValue);
  }
  
  // If it's already a string
  if (typeof dateValue === 'string') {
    // Remove time part if present (like "2003-12-02 00:00:00")
    const datePart = dateValue.split(' ')[0];
    
    // Check if it's a valid date
    const date = new Date(datePart);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  
  return null;
}

exports.uploadExcel = async (req, res) => {
  let connection;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data.length) {
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    for (const row of data) {
      // ===============================
      // 🔹 SANITIZE VALUES (IMPORTANT)
      // ===============================

      // Parse dates properly
      const dob = parseDate(row.DOB);
      const companyDoj = parseDate(row.CompanyDOJ);
      const createdAt = parseDate(row.CreatedAt) || new Date().toISOString().split('T')[0];
      const updatedAt = parseDate(row.UpdatedAt) || new Date().toISOString().split('T')[0];
      const deletedAt = parseDate(row.DeletedAt);

      const isActive = row.IsActive !== undefined && row.IsActive !== null && row.IsActive !== ""
        ? parseInt(row.IsActive, 10)
        : 1;

      const salary = row.Salary !== undefined && row.Salary !== null && row.Salary !== ""
        ? parseFloat(row.Salary)
        : 0;
      const gatePassNo =
  row.GatePassNo !== undefined && row.GatePassNo !== null && row.GatePassNo !== ""
    ? row.GatePassNo.toString()
    : null;
    //   const branchId = row.BranchID !== "" && row.BranchID != null
    //     ? parseInt(row.BranchID, 10)
    //     : null;

    //   const departmentId = row.DepartmentID !== "" && row.DepartmentID != null
    //     ? parseInt(row.DepartmentID, 10)
    //     : null;

    //   const designationId = row.DesignationID !== "" && row.DesignationID != null
    //     ? parseInt(row.DesignationID, 10)
    //     : null;
    
    // ===============================
// 🔎 BRANCH LOOKUP (by name)
// ===============================
let branchId = null;

if (row.BranchName) {
  const [branchRows] = await connection.query(
    "SELECT id FROM branches WHERE LOWER(TRIM(name)) = ? LIMIT 1",
    [row.BranchName.toLowerCase().trim()]
  );

  if (branchRows.length > 0) {
    branchId = branchRows[0].id;
  }
}

if (!branchId) {
  throw new Error(`Branch not found in DB: ${row.BranchName}`);
}

let departmentId = null;

if (row.DepartmentName) {
  const [departmentRows] = await connection.query(
    "SELECT id FROM departments WHERE LOWER(name) = ? LIMIT 1",
    [row.DepartmentName.toLowerCase().trim()]
  );

  if (departmentRows.length > 0) {
    departmentId = departmentRows[0].id;
  }
}

let designationId = null;

if (row.DesignationName) {
  const [designationRows] = await connection.query(
    "SELECT id FROM designations WHERE LOWER(name) = ? LIMIT 1",
    [row.DesignationName.toLowerCase().trim()]
  );

  if (designationRows.length > 0) {
    designationId = designationRows[0].id;
  }
}
      // 🔐 Password Hash
      let password = row.Password || "password123";
      if (!password.startsWith("$2b$")) {
        password = await bcrypt.hash(password, 10);
      }

      // ===============================
      // 1️⃣ USERS TABLE
      // ===============================
      const [existingUser] = await connection.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [row.Email]
      );

      let userId;

      if (existingUser.length > 0) {
        userId = existingUser[0].id;

        await connection.query(
          `UPDATE users 
           SET name=?, password=?, type=?, is_active=?, updated_at=? 
           WHERE id=?`,
          [
            row.Name,
            password,
            "employee",
            isActive,
            updatedAt, // Use parsed date
            userId,
          ]
        );
      } else {
        const [userResult] = await connection.query(
          `INSERT INTO users 
           (name, email, password, type, is_active, created_by, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.Name,
            row.Email,
            password,
            "employee",
            isActive,
            // row.CreatedBy || 116,
            req.user.id,
            createdAt, // Use parsed date
            updatedAt, // Use parsed date
          ]
        );

        userId = userResult.insertId;
      }

      // ===============================
      // 2️⃣ SALARY TYPE LOOKUP
      // ===============================
      let salaryTypeId = null;

      if (row.SalaryType && row.SalaryType !== "") {
        if (!isNaN(row.SalaryType)) {
          salaryTypeId = parseInt(row.SalaryType, 10);
        } else {
          const [rows] = await connection.query(
            "SELECT id FROM payslip_types WHERE LOWER(name) = ? LIMIT 1",
            [row.SalaryType.toLowerCase()]
          );

          if (rows.length) {
            salaryTypeId = rows[0].id;
          }
        }
      }

      // ===============================
      // 3️⃣ EMPLOYEES TABLE
      // ===============================
      
      // Handle Skills - check both column names
    //   const skills = row.Skills || row.Skill || row.skills || null;
    
    // ===============================
// 🔎 SKILL LOOKUP (by name)
// ===============================
let skillId = null;

const skillName = row.SkillName || row.Skill || row.Skills;

if (skillName) {
  const [skillRows] = await connection.query(
    "SELECT id FROM skills WHERE LOWER(TRIM(name)) = ? LIMIT 1",
    [skillName.toLowerCase().trim()]
  );

  if (skillRows.length > 0) {
    skillId = skillRows[0].id;
  } else {
    throw new Error(`Skill not found in DB: ${skillName}`);
  }
}

      await connection.query(
        `INSERT INTO employees 
          (user_id, name, dob, gender, phone, address, email, password, employee_id, biometric_emp_id,
           branch_id, department_id, designation_id, company_doj, documents, account_holder_name,
           account_number, bank_name, bank_identifier_code, branch_location, tax_payer_id,
           salary_type, salary, is_active, created_by, created_at, updated_at,
           aadhaar_number, employee_type, deleted_at, rejoin_reason, uan_number, ip_number, father_name, skill_id,gatepassno)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
         ON DUPLICATE KEY UPDATE 
           name=VALUES(name), dob=VALUES(dob), gender=VALUES(gender),
           phone=VALUES(phone), address=VALUES(address),
           email=VALUES(email), password=VALUES(password),
           biometric_emp_id=VALUES(biometric_emp_id),
           branch_id=VALUES(branch_id),
           department_id=VALUES(department_id),
           designation_id=VALUES(designation_id),
           company_doj=VALUES(company_doj),
           documents=VALUES(documents),
           account_holder_name=VALUES(account_holder_name),
           account_number=VALUES(account_number),
           bank_name=VALUES(bank_name),
           bank_identifier_code=VALUES(bank_identifier_code),
           branch_location=VALUES(branch_location),
           tax_payer_id=VALUES(tax_payer_id),
           salary_type=VALUES(salary_type),
           salary=VALUES(salary),
           is_active=VALUES(is_active),
           updated_at=VALUES(updated_at),
           aadhaar_number=VALUES(aadhaar_number),
           employee_type=VALUES(employee_type),
           deleted_at=VALUES(deleted_at),
           rejoin_reason=VALUES(rejoin_reason),
           uan_number=VALUES(uan_number),
           ip_number=VALUES(ip_number),
           father_name=VALUES(father_name),
           skill_id=VALUES(skill_id),
           gatepassno=VALUES(gatepassno)`,
        [
          userId,
          row.Name,
          dob, // Use parsed date
          row.Gender || null,
          row.Phone ? row.Phone.toString() : null,
          row.Address || null,
          row.Email,
          password,
          row.EmployeeID ? row.EmployeeID.toString() : null,
          row.BiometricEmpID ? row.BiometricEmpID.toString() : null,
          branchId,
          departmentId,
          designationId,
          companyDoj, // Use parsed date
          row.Documents || null,
          row.AccountHolderName || null,
          row.AccountNumber ? row.AccountNumber.toString() : null,
          row.BankName || null,
          row.BankIdentifierCode || null,
          row.BranchLocation || null,
          row.TaxPayerID ? row.TaxPayerID.toString() : null,
          salaryTypeId,
          salary,
          isActive,
        //   row.CreatedBy || 116,
        req.user.id,
          createdAt, // Use parsed date
          updatedAt, // Use parsed date
          row.AadhaarNumber ? row.AadhaarNumber.toString() : null,
          row.EmployeeType || null,
          deletedAt, // Use parsed date
          row.RejoinReason || null,
          row.UANNumber ? row.UANNumber.toString() : null,
          row.IPNumber ? row.IPNumber.toString() : null,
          row.FatherName || null,
          skillId,
          row.GatePassNo ? row.GatePassNo.toString() : null,// Use the skills variable
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: "Excel uploaded & employees imported successfully",
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};

