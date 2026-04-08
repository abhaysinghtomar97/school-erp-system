
const app = require('./app');
const PORT = process.env.PORT || 5000;

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.NEON_DATABASE_URL,
   ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    await client.connect();
    console.log("🔥 DB Connected");
  } catch (err) {
    console.log("Error:", err);
  } finally {
    await client.end();
  }
}

test();

app.listen(5000,()=>{
    console.log(`🚀 Server running on port ${PORT}`);
})



process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});