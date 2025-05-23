const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '8534e9ea0d116e341130',
  host: 'dpbdp1.easypanel.host',
  port: 900,
  database: 'boop',
  ssl: false
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0]);
    
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection(); 