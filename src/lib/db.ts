import { and, asc, desc, eq, gte, isNotNull, isNull, ne, sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/netlify-db";
import { getTableColumns, type AnyColumn } from "drizzle-orm";
import type { PgTable, AnyPgColumn } from "drizzle-orm/pg-core";
import { picks, newsletterSubscribers } from "../../db/schema";

// Initialize on first query so importing pages during compilation needs no connection.
const createClient = () => drizzle();
let client: ReturnType<typeof createClient> | undefined;
function database() {
  return client ??= createClient();
}

type Query = {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  select?: Record<string, boolean>;
};

function condition(columns: Record<string, AnyColumn>, where: Query["where"]): SQL | undefined {
  const clauses: SQL[] = [];
  for (const [key, value] of Object.entries(where ?? {})) {
    const column = columns[key];
    if (!column) throw new Error(`Unknown query field: ${key}`);
    if (value && typeof value === "object" && !(value instanceof Date)) {
      for (const [op, operand] of Object.entries(value)) {
        if (op === "gte") clauses.push(gte(column, operand));
        else if (op === "not") clauses.push(operand === null ? isNotNull(column) : ne(column, operand));
        else throw new Error(`Unsupported query operator: ${op}`);
      }
    } else clauses.push(value === null ? isNull(column) : eq(column, value));
  }
  return and(...clauses);
}

// Preserve the existing callers' small repository API while using managed Postgres.
function repository<Row, Insert extends Record<string, unknown>>(table: PgTable) {
  const columns: Record<string, AnyPgColumn> = getTableColumns(table);
  return {
    async findMany(options: Query = {}): Promise<Row[]> {
      const order = (Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy ?? {}])
        .flatMap((entry) => Object.entries(entry).map(([key, direction]) => {
          const column = columns[key];
          if (!column) throw new Error(`Unknown order field: ${key}`);
          return direction === "desc" ? desc(column) : asc(column);
        }));
      const query = database().select(options.select ? Object.fromEntries(Object.entries(options.select).filter(([, enabled]) => enabled).map(([key]) => {
        if (!columns[key]) throw new Error(`Unknown select field: ${key}`);
        return [key, columns[key]];
      })) : columns).from(table).where(condition(columns, options.where)).orderBy(...order).$dynamic();
      return await (options.take === undefined ? query : query.limit(options.take)) as unknown as Row[];
    },
    async findUnique({ where }: { where: Record<string, unknown> }): Promise<Row | null> {
      return (await this.findMany({ where, take: 1 }))[0] ?? null;
    },
    async create({ data }: { data: Insert }): Promise<Row> {
      const [row] = await database().insert(table).values(data).returning();
      return row as Row;
    },
    async update({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<Row> {
      const [row] = await database().update(table).set(data).where(condition(columns, where)).returning();
      if (!row) throw new Error("Record not found");
      return row as Row;
    },
    async delete({ where }: { where: Record<string, unknown> }) {
      return database().delete(table).where(condition(columns, where));
    },
  };
}

export const db = {
  pick: repository<typeof picks.$inferSelect, typeof picks.$inferInsert>(picks),
  newsletterSubscriber: repository<typeof newsletterSubscribers.$inferSelect, typeof newsletterSubscribers.$inferInsert>(newsletterSubscribers),
  async $queryRaw(query: TemplateStringsArray, ...parameters: unknown[]) {
    return database().execute(sql(query, ...parameters));
  },
  async $disconnect() { /* Netlify manages the connection lifecycle. */ },
};
