INSERT INTO departments (id, department_name)
VALUES 
(001, 'Engineering'),
(002, 'Finance'),
(003, 'Legal'),
(004, 'Sales');

INSERT INTO roles (title, salary, department_id)
VALUES 
('Sales Lead', 900000.00, 1),
('Lead Engineer', 175000.00, 2),
('Software Engineer', 200000.00, 3),
('Account Manager', 182000.00, 4),
('Legal Team Lead', 185000.00, 4),
('Accountant', 145000.00, 2),
('Salesperson', 80000.00, 4),
('Lawyer', 185000.00, 3),

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Gordon', 'Ryan', 1, 1),
('Craig', 'Jones', 2, 2),
('Mikey', 'Musumeci', 3, 3),
('Mika', 'Galvao', 4, 4),
('Jon', 'Thomas', 5, 5),
('Nicky', 'Ryan', 6, NULL),
('JT', 'Torres', 7, NULL),
('Adam', 'Wardziak', 8, NULL),
('Gio', 'Martinez', 9, NULL),
('Boogie', 'Martinez', 10, NULL);