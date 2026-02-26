const Assignment = require('../models/Assignment');

exports.getAllAssignments = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const filter = { isActive: true };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const assignments = await Assignment.find(filter)
      .select('title description difficulty category orderIndex createdAt')
      .sort({ orderIndex: 1, createdAt: 1 });

    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment || !assignment.isActive) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json({ assignment });
  } catch (err) {
    res.status(400).json({ error: 'Invalid assignment ID.' });
  }
};


exports.seedAssignments = async (req, res) => {
  const sampleAssignments = [
    {
      title: 'Basic Employee Query',
      description: 'Practice SELECT statements with filtering.',
      difficulty: 'beginner',
      category: 'SELECT',
      question: 'Find all employees who earn more than $50,000 per year. Display their full name, department, and salary. Order results by salary descending.',
      requirements: ['Use SELECT with specific columns', 'Filter using WHERE', 'Sort results with ORDER BY'],
      sampleTables: [
        {
          tableName: 'employees',
          schema: `CREATE TABLE employees (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(50),
            last_name VARCHAR(50),
            department VARCHAR(100),
            salary NUMERIC(10,2),
            hire_date DATE
          )`,
          sampleData: `INSERT INTO employees VALUES
            (1,'Alice','Johnson','Engineering',85000,'2020-01-15'),
            (2,'Bob','Smith','Marketing',42000,'2019-06-20'),
            (3,'Carol','White','Engineering',95000,'2018-03-10'),
            (4,'David','Brown','HR',38000,'2021-09-01'),
            (5,'Eve','Davis','Engineering',72000,'2020-11-30'),
            (6,'Frank','Miller','Marketing',55000,'2017-07-14')`,
          description: 'Employee records with salary information'
        }
      ],
      expectedOutputDescription: '4 rows: Alice, Carol, Frank, Eve ordered by salary desc',
      orderIndex: 1
    },
    {
      title: 'Department Sales Summary',
      description: 'Use GROUP BY and aggregate functions.',
      difficulty: 'intermediate',
      category: 'GROUP BY',
      question: 'Calculate the total sales amount and number of orders for each department. Only include departments with more than 2 orders. Sort by total sales descending.',
      requirements: ['Use GROUP BY', 'Use SUM() and COUNT() aggregates', 'Filter groups with HAVING'],
      sampleTables: [
        {
          tableName: 'orders',
          schema: `CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            department VARCHAR(100),
            amount NUMERIC(10,2),
            order_date DATE,
            status VARCHAR(20)
          )`,
          sampleData: `INSERT INTO orders VALUES
            (1,'Engineering',1200.00,'2024-01-05','completed'),
            (2,'Marketing',450.00,'2024-01-08','completed'),
            (3,'Engineering',980.00,'2024-01-12','completed'),
            (4,'HR',200.00,'2024-01-15','pending'),
            (5,'Engineering',2300.00,'2024-01-20','completed'),
            (6,'Marketing',600.00,'2024-01-22','completed'),
            (7,'Marketing',750.00,'2024-01-25','completed'),
            (8,'HR',180.00,'2024-01-28','completed')`,
          description: 'Sales orders by department'
        }
      ],
      expectedOutputDescription: 'Engineering (3 orders, $4480) and Marketing (3 orders, $1800)',
      orderIndex: 2
    },
    {
      title: 'Customer Order Details',
      description: 'Join multiple tables to get combined information.',
      difficulty: 'intermediate',
      category: 'JOIN',
      question: 'List all customers along with their most recent order date and total amount spent. Include customers who have never placed an order (show NULL for those). Sort by total spent descending, NULLs last.',
      requirements: ['Use LEFT JOIN', 'Use aggregate functions', 'Handle NULL values'],
      sampleTables: [
        {
          tableName: 'customers',
          schema: `CREATE TABLE customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(150),
            city VARCHAR(100)
          )`,
          sampleData: `INSERT INTO customers VALUES
            (1,'Alice Green','alice@example.com','New York'),
            (2,'Bob Lee','bob@example.com','Chicago'),
            (3,'Carol Sun','carol@example.com','Los Angeles'),
            (4,'Dan Park','dan@example.com','Houston')`
        },
        {
          tableName: 'purchases',
          schema: `CREATE TABLE purchases (
            id SERIAL PRIMARY KEY,
            customer_id INT REFERENCES customers(id),
            amount NUMERIC(10,2),
            purchase_date DATE
          )`,
          sampleData: `INSERT INTO purchases VALUES
            (1,1,250.00,'2024-02-10'),
            (2,1,180.00,'2024-03-05'),
            (3,2,420.00,'2024-01-20'),
            (4,3,95.00,'2024-02-28')`
        }
      ],
      expectedOutputDescription: 'All 4 customers, Dan shows NULL for order fields',
      orderIndex: 3
    },
    {
      title: 'Top Earners Per Department',
      description: 'Use window functions for advanced ranking.',
      difficulty: 'advanced',
      category: 'Window Functions',
      question: 'Find the top 2 highest-paid employees in each department. Show their name, department, salary, and their rank within the department.',
      requirements: ['Use RANK() or DENSE_RANK() window function', 'Use PARTITION BY', 'Filter ranked results using a subquery or CTE'],
      sampleTables: [
        {
          tableName: 'staff',
          schema: `CREATE TABLE staff (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            department VARCHAR(100),
            salary NUMERIC(10,2)
          )`,
          sampleData: `INSERT INTO staff VALUES
            (1,'Alice','Engineering',95000),
            (2,'Bob','Engineering',88000),
            (3,'Carol','Engineering',72000),
            (4,'Dave','Marketing',65000),
            (5,'Eve','Marketing',71000),
            (6,'Frank','Marketing',58000),
            (7,'Grace','HR',52000),
            (8,'Hank','HR',48000)`,
          description: 'Staff salary data across departments'
        }
      ],
      expectedOutputDescription: 'Top 2 per dept: Engineering (Alice, Bob), Marketing (Eve, Dave), HR (Grace, Hank)',
      orderIndex: 4
    }
  ];

  try {
    await Assignment.deleteMany({});
    await Assignment.insertMany(sampleAssignments);
    res.json({ message: `Seeded ${sampleAssignments.length} assignments.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
