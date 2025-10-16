import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY,
});

export const base = Airtable.base(process.env.AIRTABLE_BASE_ID!);
export const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME!;
