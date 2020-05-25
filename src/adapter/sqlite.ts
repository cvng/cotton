import { BaseAdapter, ConnectionOptions } from "../baseadapter.ts";
import { sqliteOpen, sqliteSave, SqliteDB } from "../../deps.ts";

export class SqliteAdapter extends BaseAdapter {
  /**
   * Database file location
   */
  private fileLocation: string;

  /**
   * SQLite library database instance
   */
  private client?: SqliteDB;

  constructor(options: ConnectionOptions) {
    super();

    if (typeof options.database !== "string") {
      throw new Error("SQLite adapter needs 'database' property!");
    }

    this.fileLocation = options.database!;
  }

  public async connect(): Promise<void> {
    this.client = await sqliteOpen(this.fileLocation);
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client!.close();
      resolve();
    });
  }

  public async query<T>(query: string, values: any[] = []): Promise<T[]> {
    // Execute query
    const result = this.client!.query(query, values);

    // Get columns information
    const columns = result.columns();

    // Store fetch records temporarily
    const records: T[] = [];

    // Populate `records` variable with fetched data
    for (const record of result) {
      let data: any = {};

      // Assign each known fields to `data`
      (record as any[]).forEach((value, index) => {
        const fieldName = columns[index].name;
        data[fieldName] = value;
      });

      records.push(data);
    }

    return records;
  }

  public async execute(query: string, values: any[] = []) {
    // Execute SQL statement
    this.client!.query(query, values);

    // Save changes to database file
    await sqliteSave(this.client!);
  }
}