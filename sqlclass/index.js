const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");

// Create a connection to the MySQL server (without specifying a database)
const connection = mysql.createConnection({
  host: "localhost",
  user: "vinnu",
  password: "mysql",
});

// Connect to the MySQL server
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the MySQL server:", error.stack);
    return;
  }
  console.log("Connected to the MySQL server as id " + connection.threadId);

  // Create the database if it doesn't exist
  connection.query("CREATE DATABASE IF NOT EXISTS delta_app", (err) => {
    if (err) {
      console.error("Error creating database:", err.stack);
      return;
    }
    console.log("Database 'delta_app' created or already exists.");

    // Switch to the newly created database
    connection.changeUser({ database: 'delta_app' }, (err) => {
      if (err) {
        console.error("Error switching to the database:", err.stack);
        return;
      }
      console.log("Switched to database 'delta_app'.");

      // Create the table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS user (
          id VARCHAR(50) PRIMARY KEY,
          username VARCHAR(50) UNIQUE,
          email VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(50) NOT NULL
        )
      `;

      connection.query(createTableQuery, (err) => {
        if (err) {
          console.error("Error creating table:", err.stack);
          return;
        }
        console.log("Table 'user' created or already exists.");

        // Function to create a random user
        const createRandomUser = () => {
          return {
            id: faker.string.uuid(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
          };
        };

        // Insert a random user into the database
        const insertUser = (user) => {
          const query = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
          const values = [user.id, user.username, user.email, user.password];

          connection.query(query, values, (err, results) => {
            if (err) {
              console.error("Error inserting user:", err.stack);
              return;
            }
            console.log("User inserted with ID:", results.insertId);
          });
        };

        // Generate and insert a random user
        const randomUser = createRandomUser();
        insertUser(randomUser);

        // Close the connection
        connection.end((err) => {
          if (err) {
            console.error("Error ending the connection:", err.stack);
            return;
          }
          console.log("Connection closed.");
        });
      });
    });
  });
});
