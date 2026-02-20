// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
   generateTokens(adminId: number, email: string): { access_token: string; refresh_token: string } {
    const payload = { id: adminId, email, role: 'admin' };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}