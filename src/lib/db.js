import 'server-only';
import { createClient } from '@libsql/client';

let client = null;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export const db = {
  execute: (...args) => getClient().execute(...args),
  batch: (...args) => getClient().batch(...args),
};
