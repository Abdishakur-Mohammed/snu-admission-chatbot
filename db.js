const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'snu_chatbot';

let client;
let db;

async function connectDB() {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`Connected to MongoDB: ${dbName}`);
  return db;
}

async function closeDB() {
  if (client) await client.close();
}

module.exports = { connectDB, closeDB };
