const { Pool } = require('pg');
const pool = new Pool({
    // Using the variable again instead of the hardcoded string
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;