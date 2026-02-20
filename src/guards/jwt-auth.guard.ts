import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }
    
    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    
    try {
      console.log('=== JWT GUARD DEBUG ===');
      console.log('Request time:', new Date());
      console.log('Request timestamp:', Date.now());
      console.log('Token received:', token.substring(0, 50) + '...');
      
      // Decode without verification first to see the timestamps
      const decoded = this.jwtService.decode(token);
      console.log('Decoded token (before verify):', decoded);
      
      if (decoded) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = (decoded as any).exp - now;
        console.log('Current time (sec):', now);
        console.log('Token expiry (sec):', (decoded as any).exp);
        console.log('Time until expiry:', timeUntilExpiry, 'seconds');
        
        if (timeUntilExpiry < 0) {
          console.log('❌ Token is ALREADY EXPIRED!');
        } else {
          console.log('✅ Token should be valid');
        }
      }
      
      // Now try verification
      const payload = this.jwtService.verify(token);
      console.log('✅ Token verification SUCCESSFUL');
      request['user'] = payload;
      return true;
      
    } catch (error) {
      console.log('❌ Token verification FAILED:', error.message);
      console.log('Error details:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}