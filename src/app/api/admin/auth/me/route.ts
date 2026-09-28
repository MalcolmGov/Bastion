import { NextResponse } from 'next/server';
import { getCurrentUser, ROLE_PERMISSIONS } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];

    return NextResponse.json({
      authenticated: true,
      user,
      permissions
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}
