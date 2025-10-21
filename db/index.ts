import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as authSchema from './schema/auth';
import * as projectsSchema from './schema/projects';

export const db = drizzle(process.env.DATABASE_URL!, {
    schema: {
        ...authSchema,
        ...projectsSchema,
    },
});

export {
    user,
    session,
    account,
    verification,
} from './schema/auth';

export {
    projects,
    expenses,
    invoices,
    type Project,
    type NewProject,
    type Expense,
    type NewExpense,
    type Invoice,
    type NewInvoice,
} from './schema/projects';

export type DB = typeof db;