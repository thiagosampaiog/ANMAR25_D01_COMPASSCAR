# CompassCar API

A simple API for managing car rentals, built with Node.js, Express, Sequelize, and MySQL.

## Features

- CRUD operations for cars.
- Management of car items.
- Validation of car data (e.g., year, plate format).
- Pagination and filtering for car listings.

---

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/)

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ANMAR25_D01_COMPASSCAR
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   - Create a MySQL database named `compasscar`.
   - Update the `.env` file with your database credentials:
     ```env
     DB_NAME=compasscar
     DB_USER=<your-username>
     DB_PASSWORD=<your-password>
     DB_HOST=localhost
     DB_DIALECT=mysql
     PORT=3000
     ```

---

## Running the Project

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test the API:**
   - Open your browser or use tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/).
   - Access the base route: `http://localhost:3000`
   - Use the API endpoints to interact with the system.

---

## Project Structure

```bash
ANMAR25_D01_COMPASSCAR/
├── src/
│   ├── db/
│   │   ├── conn.js          # Database connection
│   │   ├── testconnection.js # Test database connection
│   ├── models/
│   │   ├── car.js           # Car model
│   │   ├── carItem.js       # CarItem model
│   │   ├── index.js         # Model relationships
│   ├── routes/
│   │   ├── carRoutes.js     # API routes for cars
├── .env                     # Environment variables
├── .gitignore               # Ignored files
├── package.json             # Project metadata and dependencies
├── server.js                # Main server file
```

---

## Notes

- Ensure your MySQL server is running before starting the project.
- Use the `.env` file to configure sensitive data like database credentials.

