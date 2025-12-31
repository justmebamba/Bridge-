
import fs from 'fs/promises';
import path from 'path';

// A generic class to handle reading and writing to a JSON file.
export class JsonStore<T> {
  private filePath: string;
  private initialData: T;

  constructor(relativePath: string, initialData: T) {
    this.filePath = path.join(process.cwd(), relativePath);
    this.initialData = initialData;
  }

  // Reads data from the JSON file. If the file doesn't exist, it creates it.
  async read(): Promise<T> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as T;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, so write the initial data and return it.
        await this.write(this.initialData);
        return this.initialData;
      }
      throw error;
    }
  }

  // Writes data to the JSON file.
  async write(data: T): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true }); // Ensure directory exists
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error writing to file ${this.filePath}:`, error);
      throw error;
    }
  }
}
