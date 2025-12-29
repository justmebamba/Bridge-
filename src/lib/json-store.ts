
import fs from 'fs/promises';
import path from 'path';

class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  async acquire(): Promise<void> {
    return new Promise(resolve => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      this.queue.shift()?.();
    } else {
      this.locked = false;
    }
  }
}

const locks = new Map<string, Mutex>();

function getLock(filePath: string): Mutex {
  if (!locks.has(filePath)) {
    locks.set(filePath, new Mutex());
  }
  return locks.get(filePath)!;
}

export class JsonStore<T> {
  private dataFilePath: string;
  private defaultValue: T | null = null; // Can be null if not provided

  constructor(relativePath: string, defaultValue?: T) {
    this.dataFilePath = path.join(process.cwd(), relativePath);
    if (defaultValue !== undefined) {
      this.defaultValue = defaultValue;
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    const dir = path.dirname(this.dataFilePath);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async read(): Promise<T> {
    const lock = getLock(this.dataFilePath);
    await lock.acquire();
    try {
      await this.ensureDirectoryExists();
      const fileContents = await fs.readFile(this.dataFilePath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        if (this.defaultValue !== null) {
          await fs.writeFile(this.dataFilePath, JSON.stringify(this.defaultValue, null, 2));
          return this.defaultValue;
        }
        // If no default value, and file doesn't exist, we must assume an empty array for list-based stores.
        // This is a common use case for this app.
        const emptyState = [] as unknown as T;
        await fs.writeFile(this.dataFilePath, JSON.stringify(emptyState, null, 2));
        return emptyState;
      }
      throw error;
    } finally {
      lock.release();
    }
  }

  async write(data: T): Promise<void> {
    const lock = getLock(this.dataFilePath);
    await lock.acquire();
    try {
      await this.ensureDirectoryExists();
      await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    } finally {
      lock.release();
    }
  }
}
