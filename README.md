📘 NestJS Bill Payment API

A modular NestJS API that allows users to manage bills and make partial or full payments using a wallet system. The API supports user management, wallet funding, bill payment, payment tracking.

🛠️ Tech Stack
Framework: NestJS
Database: MySQL
ORM: TypeORM
Validation: class-
Architecture: Modular (User, Wallet, Power-Transaction, Ledger)
Language: TypeScript

📦 Features
Create and manage users
Create wallets
Credit and Debit wallte
Verify and make payment
Track payment history
Input validation and error handling

🚀 Getting Started

1. Clone the repository

bash
git clone https://github.com/danssy93/nestjs-bill-payment-api.git
cd nestjs-bill-payment-api

2. Install dependencies

   bash
   npm install

3. Set up environment variables
   Create a .env file at the root:

4. _Create Database_

   bash

   # Login to MySQL

   mysql -u your_username -p

   # Create database

   CREATE DATABASE bill_vending_db;

   # Exit MySQL

   exit

5. Run database migrations (optional)
   bash
   npm run typeorm:migration:run

6. Start the development server
   bash
   npm run start:dev

📁 Folder Structure

src/
├── database/
│ ├── entities/
│ │ ├── Ledger.ts
│ │ ├── User.ts
│ │ └── Wallet.ts
│ ├── repositories/
│ │ ├── wallet.repository.ts
│ │ └── base.repository.ts
│ └── enums/
│ ├── transaction-status.enum.ts
│ ├── transaction-type.enum.ts
│ └── payment-type.enum.ts
│
├── ledgers/
│ ├── controllers/
│ │ └── ledgers.controller.ts
│ ├── services/
│ │ └── ledgers.service.ts
│ ├── dtos/
│ │ └── create-ledger.dto.ts (optional)
│ └── interfaces/
│ └── ledger.interface.ts (optional)
│
├── wallets/
│ ├── controllers/
│ │ └── wallets.controller.ts
│ ├── services/
│ │ └── wallets.service.ts
│ ├── dtos/
│ │ ├── credit-wallet.dto.ts
│ │ └── debit-wallet.dto.ts
│ └── interfaces/
│ └── wallet.interface.ts
│
├── shared/
│ ├── errors/
│ │ └── AppError.ts
│ ├── enums/
│ │ └── error-messages.enum.ts
│ ├── interfaces/
│ │ └── generic-object-type.interface.ts
│ └── utils/
│ └── helpers.ts
│
├── app.module.ts
├── main.ts
└── config/
└── ormconfig.ts (or ormconfig.js / ormconfig.json)

⚙️ Environment Variables
Create a .env file in the root directory:
env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=wallet_db

🧪 Testing
npm run test

🧑‍💻 Author
Name: Daudu Tobi Emmanue

GitHub: @danssy93
