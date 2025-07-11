import { NextRequest } from 'next/server';
import { verifyToken, UserPayload } from './auth';

export function getAuthenticatedUser(request: NextRequest): UserPayload | null {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    return verifyToken(token);
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export function requireAuth(request: NextRequest, allowedRoles?: string[]): { user: UserPayload | null; error?: string } {
  const user = getAuthenticatedUser(request);
  
  if (!user) {
    return { user: null, error: 'Authentication required' };
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { user: null, error: 'Insufficient permissions' };
  }
  
  return { user };
}
