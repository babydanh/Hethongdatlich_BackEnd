import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './src/**/*.entity.ts',
  out: './drizzle',
  dialect: 'postgresql',
  // Chỉ quan tâm đến các bảng chúng ta tự định nghĩa, lờ đi các bảng hệ thống của PostGIS
  tablesFilter: ['roles', 'users', 'profiles'], 
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'Macter27122005',
    database: process.env.DATABASE_NAME || 'Hethongdatlich_system',
    ssl: false,
  },
});
