# Event Management System

A full-stack Event Management System built with the MERN stack (MySQL, Express, React, Node.js). This platform allows users to create, discover, and book events, featuring tiered pricing and integrated payment gateways.

## Features

- **User Authentication:** Secure signup and login using JSON Web Tokens (JWT) and bcrypt password hashing.
- **Event Management:** Create, view, update, and delete events.
- **Tiered Pricing:** Support for different ticket tiers (e.g., General, VIP, Premium).
- **Payment Integration:** Secure checkout flow for paid events using Razorpay.
- **Responsive UI:** Modern and visually appealing user interface built with React and Vite.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MySQL (with `mysql2`)
- Razorpay (for mock payments & payment gateway integration)
- JSON Web Tokens (JWT)
- bcryptjs

## Getting Started

### Prerequisites
- Node.js installed
- MySQL Server installed and running

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd <repository-folder>
   ```

2. **Setup Backend:**
   ```bash
   cd server
   npm install
   ```
   - Create a `.env` file in the `server` directory and add your environment variables (e.g., Database credentials, JWT Secret, Razorpay keys, Port).

3. **Setup Frontend:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application Locally

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## License
This project is licensed under the MIT License.
