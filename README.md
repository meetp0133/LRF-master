# Project: Node.js Project Generator

This project provides a streamlined way to generate new Node.js projects with predefined folder structures, models, and helper files. It includes all essential configurations, such as `.env` files and utility helpers, to kickstart your development process efficiently.

## Features
- Automatically creates a new project with the required folder structure.
- Dynamically generates models and schemas based on user input.
- Includes pre-configured `.env` and `config` files.
- Simple API endpoint to create new projects using Postman.

---

## Getting Started

### Step 1: Run the Project
1. Clone the repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the project:
   ```bash
   npm start
   ```

### Step 2: Generate a New Project
1. Open Postman.
2. Use the following endpoint to generate a new project:
   - **Endpoint:** `POST /generate-project`
   - **Headers:** `Content-Type: application/json`
   - **Payload:**
     ```json
     {
         "projectTitle": "USER-LRF-CRUD",
         "models": {
             "name": "User",
             "schema": {
                 "otp": {
                     "type": "String",
                     "required": true
                 }
             }
         }
     }
     ```
3. Send the request. The project will be generated based on the provided details.

---

## Example Folder Structure

A generated project will include the following structure:

```
PROJECT_NAME/

├── config/
│   └── key.js        # Database connection setup
│   └── constants.js        # Database connection setup
├── helpers/
│   └── helper.js               # Utility functions for the project
│   └── dateFormat.helper.js    # Utility functions for the project
│   └── loggerService.js        # Utility functions for the project
│   └── response.helper.js      # Utility functions for the project
├── models/
│   └── User.js            # User schema based on input
├── .env                   # Environment variables file
├── package.json           # Project metadata and dependencies
├── server.js              # Main server file
└── README.md              # Project documentation
```

---

## Payload Explanation
When generating a project, you need to pass the following payload:

```json
{
    "projectTitle": "USER-LRF-CRUD",
    "models": {
        "name": "User",
        "schema": {
            "otp": {
                "type": "String",
                "required": true
            }
        }
    }
}
```

- **projectTitle**: The title of the project (e.g., `USER-LRF-CRUD`).
- **models**:
  - **name**: The name of the model (e.g., `User`).
  - **schema**: The schema definition for the model, specifying fields and their properties.

---

## Notes
- Ensure that all required fields are included in the payload.
- After project generation, you can customize the folder structure and files as needed.
- Update the `.env` file with the appropriate configurations for your environment.

---

## Contributing
Feel free to fork the repository and submit pull requests to improve functionality or add new features.

---

## License
This project is licensed under the [MIT License](LICENSE).

