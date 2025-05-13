# Chain Derby API

This is the API server for the Chain Derby application. It provides endpoints for storing and retrieving race data from a PostgreSQL database using Koa as the web framework and Drizzle ORM for database interactions.

## Features

- Store race results in a PostgreSQL database
- Retrieve race results with filtering options
- MVC architecture with clean separation of concerns
- Validation using Zod schemas
- Comprehensive error handling
- Unit and integration tests

## Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

## Installation

1. Clone the repository (if you haven't already):

```bash
git clone https://your-repository-url.git
cd chain-derby
```

2. Install dependencies:

```bash
cd packages/api
npm install
```

3. Set up the PostgreSQL database:

### Option A: Using Docker Compose (Recommended)

The easiest way to get started is to use the included Docker Compose configuration:

```bash
# Start the PostgreSQL container
docker-compose up -d

# Initialize the database and run migrations
./scripts/db-init.sh
```

This will:
- Start a PostgreSQL container on port 5432
- Start a pgAdmin web interface on port 5050 (optional, for database management)
- Create the necessary database
- Run all migrations

To access pgAdmin, open http://localhost:5050 in your browser and log in with:
- Email: admin@chainderbydemo.com
- Password: pgadmin_password

### Option B: Using an Existing PostgreSQL Installation

If you prefer to use an existing PostgreSQL installation:

```bash
# Create the database
createdb chain_derby
```

4. Configure environment variables:

Copy the `.env.example` file to `.env` and update the values if you're not using the default Docker setup:

```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

5. Run database migrations:

```bash
npm run migration:push
```

## Usage

### Development

```bash
npm run dev
```

This will start the server with hot-reloading enabled.

### Production

```bash
npm run build
npm start
```

## Project Structure

```
/packages/api
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── db/             # Database connection and schema
│   ├── middleware/     # Middleware functions
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── test/               # Test files
├── docs/               # Documentation
├── drizzle/            # Drizzle migrations
├── .env                # Environment variables
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## API Documentation

For detailed API documentation, see [API Documentation](./docs/api-documentation.md).

## Database Schema

The database consists of the following tables:

1. `race_sessions` - Stores metadata about race sessions
2. `chain_results` - Stores individual chain results for each race
3. `transaction_details` - Stores detailed data for each transaction

## Testing

```bash
npm test
```

This will run all tests using Jest.

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build the application
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run migration:generate` - Generate migration files
- `npm run migration:push` - Apply migrations to the database
- `npm run migration:drop` - Drop all tables in the database

## Integration with Frontend

To integrate with the Chain Derby frontend, the API provides endpoints for:

1. Storing race results after each race is completed
2. Retrieving past race results for display
3. Retrieving statistics about chain performance

See the API documentation for example integration code.

## License

MIT