# 💼 Commercial Management System

A full-stack web application built with **.NET 8 Web API** and **Angular** for managing clients, products, and commercial operations.

---

## 🚀 Tech Stack

* **Backend:** .NET 8 Web API, Entity Framework Core, SQLite, BCrypt
* **Frontend:** Angular, RxJS, TypeScript
* **Database:** SQLite
* **Containerization:** Docker & Docker Compose

---

## ⚡ Quick Start (Using Docker - Recommended)

The fastest way to run the entire stack (Database, API, and Frontend):

1. **Clone the repository:**
   ```bash
   git clone https://github.com/3LHECH/test_isig_dig.git
   cd test_isig_dig
   ```

2. **Start all services:**
   ```bash
   docker compose up -d
   ```

3. **Access the application:**
   * **Frontend:** http://localhost:4200
   * **API:** http://localhost:5065

4. **Stop the application:**
   ```bash
   docker compose down
   ```

---

## 🛠 Local Development (Without Docker)

### Prerequisites
* [.NET SDK 8.0+](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/) (v18+)
* [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Backend Setup

1. **Restore dependencies:**
   ```bash
   cd test-.net
   dotnet restore
   ```

2. **Apply database migration (if needed):**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

3. **Run the API:**
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5065`

### Frontend Setup

1. **Restore dependencies:**
   ```bash
   cd test_angular
   npm install
   ```

2. **Run the application:**
   ```bash
   ng serve
   ```
   The application will be available at `http://localhost:4200`

3. **Build for production:**
   ```bash
   ng build
   ```

---

## 📁 Project Structure

```
test-.net/                  # Backend API
├── Controllers/          # API endpoints
├── DTOs/                 # Data Transfer Objects
├── Interfaces/           # Service interfaces
├── Models/               # Entity models
├── Services/             # Business logic
└── appsettings.json      # Configuration

test_angular/             # Angular Frontend
├── src/app/
│   ├── core/             # Services & guards
│   ├── models/           # Frontend models
│   ├── pages/            # Main pages
│   └── shared/           # Components & pipes
└── angular.json          # Angular configuration
```
