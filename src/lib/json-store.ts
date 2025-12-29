
import fs from 'fs/promises';
import path from 'path';

// Simple mutex implementation to prevent race conditions on file access
class Mutex {
  private queue: (() => void)[] = [];
  private locked = false;

  lock(): Promise<void> {
    return new Promise((resolve) => {
      if (this.locked) {
        this.queue.push(resolve);
      } else {
        this.locked = true;
        resolve();
      }
    });
  }

  unlock(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    } else {
      this.locked = false;
    }
  }
}

// Maintain a map of locks, one for each file path
const locks = new Map<string, Mutex>();

function getLock(filePath: string): Mutex {
  if (!locks.has(filePath)) {
    locks.set(filePath, new Mutex());
  }
  return locks.get(filePath)!;
}

export class JsonStore<T> {
  private dataFilePath: string;
  private defaultValue: T;

  constructor(relativePath: string, defaultValue: T) {
    this.dataFilePath = path.join(process.cwd(), relativePath);
    this.defaultValue = defaultValue;
  }

  async read(): Promise<T> {
    const lock = getLock(this.dataFilePath);
    await lock.lock();
    try {
      // Ensure the directory exists before trying to read
      const dir = path.dirname(this.dataFilePath);
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.access(this.dataFilePath);
      const fileContents = await fs.readFile(this.dataFilePath, 'utf8');
      if (!fileContents) return this.defaultValue;
      return JSON.parse(fileContents);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, so we write the default value and return it
        await this.write(this.defaultValue);
        return this.defaultValue;
      }
      throw error;
    } finally {
      lock.unlock();
    }
  }

  async write(data: T): Promise<void> {
    const lock = getLock(this.dataFilePath);
    await lock.lock();
    try {
      const dir = path.dirname(this.dataFilePath);
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2));
    } finally {
      lock.unlock();
    }
  }
}
