
'use server';

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import type { AdminUser } from '@/lib/types';

// Simple in-memory password store for demonstration. 
// DO NOT USE IN PRODUCTION. Use a secure hashing library like bcrypt.
const passwords: Record<string, string> = {};
const generateId = () => Math.random().toString(36).substr(2, 9);


const dataFilePath = path.join(process.cwd(), 'src/data/admins.json');

async function readAdmins(): Promise<AdminUser[]> {
  try {
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    if (!fileContents) return [];
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

async function writeAdmins(data: AdminUser[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const admins = await readAdmins();
    return NextResponse.json(admins);
  } catch (error: any) {
    console.error('Error reading admins data:', error);
    return NextResponse.json({ message: 'Could not read admins data.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, password, isVerified, login } = body;

    let admins = await readAdmins();

    // Handle Login
    if (login) {
        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required for login.' }, { status: 400 });
        }
        const admin = admins.find(a => a.email === email);
        if (!admin) {
             return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }
        if (passwords[admin.id] !== password) {
             return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }
        if (!admin.isVerified) {
            return NextResponse.json({ message: 'Your account is pending approval.' }, { status: 403 });
        }
        return NextResponse.json(admin, { status: 200 });
    }

    const adminIndex = admins.findIndex(admin => admin.id === id);

    // Update existing admin (verification)
    if (id && adminIndex > -1) {
        if (typeof isVerified === 'boolean') {
            admins[adminIndex].isVerified = isVerified;
            await writeAdmins(admins);
            return NextResponse.json(admins[adminIndex], { status: 200 });
        }
    }
    
    // Create new admin
    if (email && password) {
        if (admins.some(admin => admin.email === email)) {
            return NextResponse.json({ message: 'Email already in use.' }, { status: 409 });
        }
        
        const isMainAdmin = admins.length === 0;
        const newAdmin: AdminUser = {
            id: generateId(),
            email: email,
            isVerified: isMainAdmin,
            isMainAdmin: isMainAdmin,
            createdAt: new Date().toISOString(),
        };

        // Store password in memory (NOT FOR PRODUCTION)
        passwords[newAdmin.id] = password;

        admins.push(newAdmin);
        await writeAdmins(admins);
        return NextResponse.json(newAdmin, { status: 200 });
    }
    
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });

  } catch (error: any) {
    console.error('Error processing admin request:', error);
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
