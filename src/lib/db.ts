
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres.siobxhiapakmddwytgtr',
  host: 'aws-1-eu-north-1.pooler.supabase.com',
  database: 'postgres',
  password: 'isezeranoApp12@',
  port: 5432,
});

export default pool;
