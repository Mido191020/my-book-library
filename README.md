

## **My Book Library**

A simple RESTful API for managing your personal book collection. This project includes user authentication and input validation to create a secure and functional backend system.

---

### **Features**

#### **Books Management**
- Add new books to your collection.
- Fetch all books or specific books by ID.
- Update your reading progress, including marking books as completed.
- Delete books from your collection.

#### **User Authentication**
- Secure routes with a basic authentication system.
- User registration and login with password hashing and JWT tokens.

#### **Input Validation**
- Validate inputs for book creation, updating progress, and user registration.
- Ensure error handling for invalid or missing inputs.

---

### **Tech Stack**

- **Node.js** (Runtime environment)
- **Express.js** (Web framework)
- **MongoDB** (NoSQL database)
- **Mongoose** (ODM for MongoDB)
- **bcryptjs** (Password hashing)
- **jsonwebtoken** (JWT for authentication)
- **express-validator** (Input validation)

---

### **API Endpoints**

#### **Books**
| Method | Endpoint         | Description                           |
|--------|------------------|---------------------------------------|
| POST   | `/books`         | Add a new book.                      |
| GET    | `/books`         | Fetch all books.                     |
| GET    | `/books/:id`     | Fetch a specific book by ID.         |
| PATCH  | `/books/:id`     | Update currentPage and mark completed. |
| DELETE | `/books/:id`     | Delete a book by ID.                 |

#### **Users**
| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | `/users/register`  | Register a new user.     |
| POST   | `/users/login`     | Log in and get a JWT.    |

---

### **Installation**

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/my-book-library.git
   ```

2. Navigate to the project directory:

   ```bash
   cd my-book-library
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file and add the following environment variables:

   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_secret_key
   ```

5. Start the development server:

   ```bash
   npm start
   ```

---

### **Usage**

1. Use **Postman** or any REST API client to interact with the API endpoints.
2. Test both book management and user authentication features.

---

### **Tasks**

#### **Phase 1: Book Management**
- Design and implement the Book schema:
  - Fields: `title`, `author`, `totalPages`, `currentPage`, `notes`, `completed (boolean)`, `createdAt`.
- Create RESTful routes for managing books.
- Test routes using Postman.
- Handle errors (e.g., missing fields, invalid IDs).

#### **Phase 2: Authentication**
- Install and configure `jsonwebtoken` and `bcryptjs`.
- Design the User schema with fields: `username`, `email`, `password (hashed)`, `createdAt`.
- Create authentication routes:
  - Register users.
  - Log in users and return JWT tokens.
- Add middleware to secure book routes.

#### **Phase 3: Input Validation**
- Use `express-validator` to validate inputs.
- Add validation for:
  - Book creation (e.g., `title` and `totalPages` are required).
  - Updating progress (e.g., `currentPage` must be within range).
  - User registration (e.g., email format and password strength).
- Implement global error-handling middleware for better error messages.

#### **Phase 4: Code Optimization**
- Clean up the codebase.
- Add comments and documentation for better readability.

---

### **Future Improvements**
- Add user-specific book collections.
- Implement pagination for fetching books.
- Add unit tests for all routes.
- Deploy the application to a cloud platform.

---

### **License**
This project is licensed under the MIT License.

---

