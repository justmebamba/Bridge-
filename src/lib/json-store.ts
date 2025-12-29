
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

// Simple mutex implementation
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
      this.queue.shift()!();
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

type UpdateResult<R> = {
  updatedData: T;
  result: R;
  status?: number;
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
      await fs.access(this.dataFilePath);
      const fileContents = await fs.readFile(this.dataFilePath, 'utf8');
      if (!fileContents) return this.defaultValue;
      return JSON.parse(fileContents);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
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
  
  async update<R>(
    updater: (data: T) => Promise<{ updatedData: T, result: R, status?: number }>
  ): Promise<NextResponse> {
    const lock = getLock(this.dataFilePath);
    await lock.lock();
    let currentData;
    try {
      try {
          await fs.access(this.dataFilePath);
          const fileContents = await fs.readFile(this.dataFilePath, 'utf8');
          currentData = fileContents ? JSON.parse(fileContents) : this.defaultValue;
      } catch (error) {
           if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                currentData = this.defaultValue;
           } else {
            throw error;
           }
      }

      const { updatedData, result, status = 200 } = await updater(currentData);

      const dir = path.dirname(this.dataFilePath);
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
      await fs.writeFile(this.dataFilePath, JSON.stringify(updatedData, null, 2));
      
      return NextResponse.json(result, { status });
    } finally {
      lock.unlock();
    }
  }
}
