const inquirer = require("inquirer");
const mysql = require("mysql2");
require('dotenv').config();

// console.log(process.env);

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

// connect to the database
connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to the database!");
    // start the application
    start();
});

console.log(
    ` 
    ---------------------------------------------------------- 
                                                          
    ███████╗███╗░░░███╗██████╗░██╗░░░░░█████╗░██╗░░██╗███████╗███████╗ 
    ██╔════╝████╗░████║██╔══██╗██║░░░░░██╔══██╗╚██╗░██╔╝██╔════╝██╔════╝
    █████╗░░██╔████╔██║██████╔╝██║░░░░░██║░░██║░╚████╔╝░█████╗░░█████╗░░
    ██╔══╝░░██║╚██╔╝██║██╔═══╝░██║░░░░░██║░░██║░░╚██╔╝░░██╔══╝░░██╔══╝░░
    ███████╗██║░╚═╝░██║██║░░░░███████╗╚█████╔╝░░██║░░███████╗███████╗
    ╚══════╝╚═╝░░░░░╚═╝╚═╝░░░░╚══════╝░╚════╝░░░╚═╝░░╚══════╝╚══════╝
    ███╗░░███╗░█████╗░███╗░░██╗░█████╗░░██████╗░███████╗██████╗░
    ████╗░████║██╔══██╗████╗░██║██╔══██║██╔════╝░██╔════╝██╔══██╗
    ██╔███╔██║██████║██╔██╗██║██████║██║░░██╗░██████╗░██████╔╝
    ██║╚██╔╝██║██╔══██║██║╚████║██╔══██║██║░░╚██╗██╔══╝░░██╔══██╗
    ██║░╚═╝░██║██║░░██║██║░╚███║██║░░██║╚██████╔╝███████╗██║░░██║
    ╚═╝░░░░░╚═╝╚═╝░░░░╚═╝░░╚══╝╚═╝░░╚═════╝░╚══════╝╚═╝░░╚═╝
    ` ); 

// Function to Start SQL Employee tracker Application
function start() {
    inquirer
        .prompt({
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: [
                "View all departments",
                "View all roles",
                "View all employees",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Add a Manager",
                "Update an employee role",
                "View Employees by Manager",
                "View Employees by Department",
                "Delete Departments | Roles | Employees",
                "View the total utilized budget of a department",
                "Exit",
            ],
        })
        .then((response) => {
            const actions = {
                "View all departments": viewAllDepartments,
                "View all roles": viewAllRoles,
                "View all employees": viewAllEmployees,
                "Add a department": addDepartment,
                "Add a role": addRole,
                "Add employee": addEmployee,
                "Add a Manager": addManager,
                "Update employee role": updateEmployeeRole,
                "View Employees by Manager": viewEmployeesByManager,
                "View Employees by Department": viewEmployeesByDepartment,
                "Delete Departments, Roles, Employees": deleteDepartmentsRolesEmployees,
                "View the total utilized budget of a department": calculateDepartmentBudget,
                "Exit": () => {
                    connection.end();
                    console.log("Goodbye!");
                }
            };
        
            if (actions[response.action]) {
                actions[response.action]();
            } else {
                console.log("Invalid action selected.");
            }});
        };

        function viewAllDepartments() {
            const query = "SELECT * FROM departments";
            
            const handleQueryResult = (err, res) => {
                if (err) {
                    throw err;
                }
                console.table(res);
                // restart the application
                start();
            };
        
            connection.query(query, handleQueryResult);
        }
        
        function viewAllRoles() {
            const query = `
                SELECT roles.title, roles.id, departments.department_name, roles.salary 
                FROM roles 
                JOIN departments ON roles.department_id = departments.id
            `;
            
            const handleQueryResult = (err, res) => {
                if (err) {
                    throw err;
                }
                console.table(res);
                // restart the application
                start();
            };
        
            connection.query(query, handleQueryResult);
        }

        function viewAllEmployees() {
            const query = `
                SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                FROM employee e
                LEFT JOIN roles r ON e.role_id = r.id
                LEFT JOIN departments d ON r.department_id = d.id
                LEFT JOIN employee m ON e.manager_id = m.id;
            `;
        
            connection.query(query, (error, results) => {
                if (error) {
                    throw error;
                }
                console.table(results);
                start();
            });
        }
        

        function addDepartment() {
            inquirer.prompt({
                type: "input",
                name: "name",
                message: "Enter the name of the new department:",
            }).then((response) => {
                const query = `INSERT INTO departments (department_name) VALUES (?)`;
                connection.query(query, [response.name], (error, results) => {
                    if (error) {
                        throw error;
                    }
                    console.log(`Department ${response.name} added successfully!`);
                    start();
                });
            });
        }
        

        function addRole() {
            connection.query("SELECT * FROM departments", (error, departments) => {
                if (error) {
                    throw error;
                }
        
                inquirer.prompt([
                    {
                        type: "input",
                        name: "title",
                        message: "Enter the title of the new role:",
                    },
                    {
                        type: "input",
                        name: "salary",
                        message: "Enter the salary of the new role:",
                    },
                    {
                        type: "list",
                        name: "departmentId",
                        message: "Select the department for the new role:",
                        choices: departments.map(dept => ({ name: dept.department_name, value: dept.id })),
                    },
                ]).then((answers) => {
                    const query = "INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)";
                    connection.query(query, [answers.title, answers.salary, answers.departmentId], (error, results) => {
                        if (error) {
                            throw error;
                        }
                        console.log(`Role ${answers.title} added successfully!`);
                        start();
                    });
                });
            });
        }
        

        function addEmployee() {
            connection.query("SELECT id, title FROM roles", (error, roles) => {
                if (error) {
                    throw error;
                }
        
                connection.query("SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee", (error, employees) => {
                    if (error) {
                        throw error;
                    }
        
                    inquirer.prompt([
                        {
                            type: "input",
                            name: "firstName",
                            message: "Enter the employee's first name:",
                        },
                        {
                            type: "input",
                            name: "lastName",
                            message: "Enter the employee's last name:",
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Select the employee's role:",
                            choices: roles.map(role => ({ name: role.title, value: role.id })),
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Select the employee's manager:",
                            choices: [{ name: "None", value: null }, ...employees.map(emp => ({ name: emp.name, value: emp.id }))],
                        },
                    ]).then((answers) => {
                        const query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
                        connection.query(query, [answers.firstName, answers.lastName, answers.roleId, answers.managerId], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            console.log("Employee added successfully!");
                            start();
                        });
                    });
                });
            });
        }
        
        function addManager() {
            connection.query("SELECT * FROM departments", (error, departments) => {
                if (error) {
                    throw error;
                }
        
                connection.query("SELECT * FROM employee", (error, employees) => {
                    if (error) {
                        throw error;
                    }
        
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "departmentId",
                            message: "Select the department:",
                            choices: departments.map(dept => ({ name: dept.department_name, value: dept.id })),
                        },
                        {
                            type: "list",
                            name: "employeeId",
                            message: "Select the employee to assign as manager:",
                            choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })),
                        },
                        {
                            type: "list",
                            name: "managerId",
                            message: "Select the manager:",
                            choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })),
                        },
                    ]).then((answers) => {
                        const query = `
                            UPDATE employee 
                            SET manager_id = ? 
                            WHERE id = ? 
                            AND role_id IN (SELECT id FROM roles WHERE department_id = ?)
                        `;
                        connection.query(query, [answers.managerId, answers.employeeId, answers.departmentId], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            console.log("Manager assigned successfully!");
                            start();
                        });
                    });
                });
            });
        }
        
        function updateEmployeeRole() {
            connection.query("SELECT id, first_name, last_name FROM employee", (error, employees) => {
                if (error) {
                    throw error;
                }
        
                connection.query("SELECT id, title FROM roles", (error, roles) => {
                    if (error) {
                        throw error;
                    }
        
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "employeeId",
                            message: "Select the employee to update:",
                            choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })),
                        },
                        {
                            type: "list",
                            name: "roleId",
                            message: "Select the new role:",
                            choices: roles.map(role => ({ name: role.title, value: role.id })),
                        },
                    ]).then((answers) => {
                        const query = "UPDATE employee SET role_id = ? WHERE id = ?";
                        connection.query(query, [answers.roleId, answers.employeeId], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            console.log("Employee role updated successfully!");
                            start();
                        });
                    });
                });
            });
        }
        

// Function to View Employee By Manager
function viewEmployeesByManager() {
    const query = `
        SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
        FROM employee e
        JOIN roles r ON e.role_id = r.id
        JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id
        ORDER BY manager_name, e.last_name, e.first_name
    `;

    connection.query(query, (error, results) => {
        if (error) {
            throw error;
        }

        const employeesByManager = results.reduce((acc, cur) => {
            const manager = cur.manager_name || "No Manager";
            if (!acc[manager]) {
                acc[manager] = [];
            }
            acc[manager].push(cur);
            return acc;
        }, {});

        console.log("Employees by Manager:");
        for (const manager in employeesByManager) {
            console.log(`\n${manager}:`);
            employeesByManager[manager].forEach(emp => {
                console.log(`  ${emp.first_name} ${emp.last_name} | ${emp.title} | ${emp.department_name}`);
            });
        }
        start();
    });
}

function viewEmployeesByDepartment() {
    const query = `
        SELECT d.department_name, e.first_name, e.last_name 
        FROM employee e 
        JOIN roles r ON e.role_id = r.id 
        JOIN departments d ON r.department_id = d.id 
        ORDER BY d.department_name
    `;

    connection.query(query, (error, results) => {
        if (error) {
            throw error;
        }
        console.log("\nEmployees by Department:");
        console.table(results);
        start();
    });
}

// Function to DELETE Departments Roles Employees
function deleteDepartmentsRolesEmployees() {
    inquirer.prompt({
        type: "list",
        name: "choice",
        message: "What would you like to delete?",
        choices: ["Employee", "Role", "Department"],
    }).then((response) => {
        switch (response.choice) {
            case "Employee":
                deleteEmployee();
                break;
            case "Role":
                deleteRole();
                break;
            case "Department":
                deleteDepartment();
                break;
            default:
                console.log("Invalid choice");
                start();
                break;
        }
    });
}

// Function to DELETE Employees
function deleteEmployee() {
    const fetchEmployees = "SELECT * FROM employee";
    connection.query(fetchEmployees, (error, results) => {
        if (error) throw error;

        const employees = results.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
        }));
        employees.push({ name: "Return to previous menu", value: "back" });

        inquirer
            .prompt({
                type: "list",
                name: "employeeId",
                message: "Choose the employee to remove:",
                choices: employees,
            })
            .then((response) => {
                if (response.employeeId === "back") {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const removeQuery = "DELETE FROM employee WHERE id = ?";
                connection.query(removeQuery, [response.employeeId], (err) => {
                    if (err) throw err;
                    console.log(`Employee with ID ${response.employeeId} has been removed from the database!`);
                    start();
                });
            });
    });
}
// Function to DELETE ROLE
function deleteRole() {
    const fetchRoles = "SELECT * FROM roles";
    connection.query(fetchRoles, (error, results) => {
        if (error) throw error;

        const roles = results.map((role) => ({
            name: `${role.title} (${role.id}) - ${role.salary}`,
            value: role.id,
        }));
        roles.push({ name: "Return to previous menu", value: null });

        inquirer
            .prompt({
                type: "list",
                name: "roleId",
                message: "Choose the role to remove:",
                choices: roles,
            })
            .then((response) => {
                if (response.roleId === null) {
                    deleteDepartmentsRolesEmployees();
                    return;
                }
                const removeQuery = "DELETE FROM roles WHERE id = ?";
                connection.query(removeQuery, [response.roleId], (err) => {
                    if (err) throw err;
                    console.log(`Role with ID ${response.roleId} has been removed from the database!`);
                    start();
                });
            });
    });
}
// Fuction to DELETE Department
function deleteDepartment() {
    const fetchDepartments = "SELECT * FROM departments";
    connection.query(fetchDepartments, (error, results) => {
        if (error) throw error;

        const departmentOptions = results.map((department) => ({
            name: department.department_name,
            value: department.id,
        }));

        // Prompt the user to choose a department
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "Select the department to remove:",
                choices: [
                    ...departmentOptions,
                    { name: "Return to previous menu", value: "back" },
                ],
            })
            .then((response) => {
                if (response.departmentId === "back") {
                    // Return to the previous menu
                    deleteDepartmentsRolesEmployees();
                } else {
                    const deleteQuery = "DELETE FROM departments WHERE id = ?";
                    connection.query(deleteQuery, [response.departmentId], (err) => {
                        if (err) throw err;
                        console.log(
                            `Removed department with ID ${response.departmentId} from the database!`
                        );
                        // Restart the application
                        start();
                    });
                }
            });
    });
}
// Function to view Total Utilized Budget of Department
function calculateDepartmentBudget() {
    const fetchDepartments = "SELECT * FROM departments";
    connection.query(fetchDepartments, (error, departments) => {
        if (error) throw error;

        const departmentOptions = departments.map((department) => ({
            name: department.department_name,
            value: department.id,
        }));

        // Prompt user to choose a department
        inquirer
            .prompt({
                type: "list",
                name: "departmentId",
                message: "Select a department to view its total salary budget:",
                choices: departmentOptions,
            })
            .then((response) => {
                // Calculate the total salary for the chosen department
                const budgetQuery = `
                    SELECT 
                        departments.department_name AS department,
                        SUM(roles.salary) AS total_salary
                    FROM 
                        departments
                        INNER JOIN roles ON departments.id = roles.department_id
                        INNER JOIN employee ON roles.id = employee.role_id
                    WHERE 
                        departments.id = ?
                    GROUP BY 
                        departments.id;
                `;
                connection.query(budgetQuery, [response.departmentId], (err, result) => {
                    if (err) throw err;
                    const totalSalary = result[0].total_salary;
                    console.log(
                        `The total salary for employees in this department is $${totalSalary}`
                    );
                    // Restart the application
                    start();
                });
            });
    });
}

// Close the connection when the application exits
process.on("exit", () => {
    connection.end();
});