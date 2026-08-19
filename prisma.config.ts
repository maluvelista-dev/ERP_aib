import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// `prisma generate` runs during image builds, where hosting providers may not
// expose runtime secrets. The placeholder is only parsed by the generator;
// the application still requires DATABASE_URL when it starts.
const datasourceUrl = process.env.MIGRATION_DATABASE_URL
  || process.env.DATABASE_URL
  || 'mysql://build:build@127.0.0.1:3306/build';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.js'
  },
  datasource: {
    url: datasourceUrl
  }
});
