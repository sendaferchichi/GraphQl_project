# GraphQL Project

## Overview
This project is a GraphQL API built with Prisma and SQLite. It provides endpoints to manage users, CVs, and skills.

## Features
- User management
- CV management
- Skill management
- GraphQL API with resolvers for queries and mutations

## Setup

### Prerequisites
- Node.js (v24.15.0)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/sendaferchichi/GraphQl_project.git
   ```
2. Navigate to the project directory:
   ```bash
   cd GraphQl_project
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Database Setup
1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
2. Seed the database:
   ```bash
   npx prisma db seed
   ```

### Running the Server
Start the development server:
```bash
npm run dev
```

## Usage
Access the GraphQL Playground at `http://localhost:4000` to test queries and mutations.

## Example Queries
### Get All CVs
```graphql
query {
  getAllCvs {
    name
    age
    owner {
      name
    }
    skills {
      designation
    }
  }
}
```

## Contributing
Feel free to submit issues or pull requests to improve the project.

## License
This project is licensed under the MIT License.