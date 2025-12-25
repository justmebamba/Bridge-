
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { AdminUser } from '@/lib/types';

const dataFilePath = path.join(process.cwd(), 'src/data/admins.json');

async function readAdmins(): Promise<AdminUser[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents) as AdminUser[];
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading admins data:', error);
    throw new Error('Could not read admins data.');
  }
}

async function writeAdmins(admins: AdminUser[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(admins, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing admins data:', error);
    throw new Error('Could not write admins data.');
  }
}

export async function GET() {
  try {
    const admins = await readAdmins();
    return NextResponse.json(admins);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Admin ID is required' }, { status: 400 });
    }

    const admins = await readAdmins();
    const existingAdminIndex = admins.findIndex(a => a.id === id);

    if (existingAdminIndex !== -1) {
      // Update existing admin (e.g., verification status)
      const { isVerified } = body;
      if (typeof isVerified === 'boolean') {
        admins[existingAdminIndex].isVerified = isVerified;
      }
    } else {
      // Create new admin
      if (!body.email) {
          return NextResponse.json({ message: 'Email is required for new admin' }, { status: 400 });
      }

      // The first user to register is the main admin
      const isMainAdmin = admins.length === 0;

      const newAdmin: AdminUser = {
        id: id,
        email: body.email,
        isVerified: isMainAdmin, // Main admin is auto-verified
        isMainAdmin: isMainAdmin,
        createdAt: new Date().toISOString(),
      };
      admins.push(newAdmin);
    }

    await writeAdmins(admins);
    
    const responseData = admins.find(a => a.id === id);

    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
