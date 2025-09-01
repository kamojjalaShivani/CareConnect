# CareConnect

CareConnect is a comprehensive care management application designed to streamline the coordination of care services between families, providers, and administrators. Built with a modern technology stack including React, TypeScript, Vite, and a Node.js backend, CareConnect offers a user-friendly interface and robust functionality to manage care requests, provider assignments, scheduling, and more.

## Features

*   **Care Request Management:** Create, view, edit, and manage care requests with detailed information on family needs, scheduling preferences, and care requirements.
*   **Provider Management:** Maintain a comprehensive directory of care providers, including their specialties, availability, and contact information.
*   **Automated Assignment Suggestions:** Leverage an intelligent matching algorithm to suggest the best-suited providers for each care request based on skills, availability, and preferences.
*   **Scheduling and Availability:** Coordinate schedules and assignments efficiently, ensuring seamless service delivery.
*   **User Authentication and Authorization:** Secure access to the application with role-based permissions for administrators, providers, and families.
*   **Real-time Updates:** Stay informed with real-time updates on care requests, assignments, and provider availability.

## Technologies Used

*   **Frontend:**
    *   React: A JavaScript library for building user interfaces.
    *   TypeScript: A superset of JavaScript that adds static typing.
    *   Vite: A fast build tool for modern web development.
    *   Lucide React: A library of beautiful and consistent icons.
    *   Date-fns: A modern JavaScript date utility library.
*   **Backend:**
    *   Node.js: A JavaScript runtime built on Chrome's V8 JavaScript engine.
    *   Express: A minimal and flexible Node.js web application framework.
    *   SQLite: A self-contained, high-reliability, embedded, full-featured, public-domain, SQL database engine.
    *   Sequelize: A promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server.

## Getting Started

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```
2.  Install dependencies:

    ```bash
    cd <project_directory>
    npm install
    cd server
    npm install
    cd ..
    ```
3.  Configure environment variables:

    *   Create a `.env` file in the `server` directory and configure the necessary environment variables (refer to `.env.example` for the required variables).
4.  Initialize the database:

    ```bash
    cd server
    npm run db:init
    cd ..
    ```
5.  Start the development server:

    ```bash
    npm run dev
    ```

    This will start both the frontend and backend development servers. The frontend will be accessible at `http://localhost:5173`, and the backend will be running on `http://localhost:3000`.




