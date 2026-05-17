import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const pathsToSearch = [
    path.join(process.cwd(), 'version.json'),
    path.join(process.cwd(), '.next', 'standalone', 'version.json'),
    path.join(__dirname, 'version.json'),
    path.join(__dirname, '..', 'version.json'),
    path.join(__dirname, '..', '..', 'version.json'),
  ];

  for (const filePath of pathsToSearch) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
      }
    } catch (e) {
      // ignore
    }
  }

  return NextResponse.json({
    webVersion: '0.1.0',
    apiVersion: '0.0.1',
    commit: 'development',
    buildDate: new Date().toISOString()
  });
}
