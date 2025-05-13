# 🛒 Ecommerce Microservices Architecture

This is a scalable and modular **eCommerce backend system** built using the **microservices architecture pattern**. Each service is independently developed and maintained, which helps in scalability, maintainability, and fault isolation. The services communicate via REST APIs and are orchestrated using Docker and Docker Compose.

---

## 📦 Microservices Overview

| Service       | Description                                                      |
|---------------|------------------------------------------------------------------|
| **Auth**      | Handles user authentication and JWT-based login/registration.   |
| **User**      | Manages user profiles and related data.                         |
| **Products**  | Manages product listing, creation, and updates.                 |
| **Inventorys**| Tracks and manages inventory stock.                             |
| **Cart**      | Handles shopping cart operations.                              |
| **Order**     | Manages order placement, status, and history.                   |
| **Email**     | Sends emails for notifications, verifications, etc.            |
| **API Gateway** | Acts as the single entry point for routing and load balancing.|

---

## 🧱 Project Structure

```

ecommerce-microservice/
├── api-geteway/             # Central API gateway for routing requests
├── services/
│   ├── auth/                # Authentication service
│   ├── user/                # User service
│   ├── products/            # Product catalog service
│   ├── inventorys/          # Inventory service
│   ├── cart/                # Cart management service
│   ├── order/               # Order processing service
│   └── email/               # Email notification service
├── docker-compose.yml       # Docker orchestration file
└── .gitignore               # Git ignored files list

````

---

## 🚀 Getting Started

### 🛠 Prerequisites

- Docker
- Docker Compose
- Node.js (for local service testing if needed)

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arifnextdev/ecommerce-microservice.git
   cd ecommerce-microservice
````

2. **Run using Docker Compose**

   ```bash
   docker-compose up --build
   ```

3. **Access Services**

   Each service will be available on its respective port (check `docker-compose.yml` for details).

---

## ⚙️ Technologies Used

* **Node.js** & **Express.js**
* **Docker** & **Docker Compose**
* **REST APIs**
* **JWT Authentication**
* **Microservices Design Pattern**

---

## 📌 Features

* Independent deployable services
* Containerized architecture with Docker
* API Gateway routing
* Secure JWT authentication
* Scalable and fault-tolerant design

---

## 🧪 Testing

You can test individual services by accessing their API endpoints locally, or through Postman.

For example:

```
GET http://localhost:<auth_port>/api/auth/health
```

---

## 📬 Contact

**Developer**: [Arif NextDev](https://github.com/arifnextdev)
📧 **Email**: [arifnextdev@gmail.com](mailto:arifnextdev@gmail.com)

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

> 🚧 This project is under active development. Feedback and contributions are welcome!


