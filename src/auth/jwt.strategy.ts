import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import prisma from 'src/lib/prisma';

interface payloadProps {
  id: number,
  email: string,
  role: string,
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'N/A',
    });
  }

  async validate(payload: payloadProps) {
    if (!payload.id || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const findUser = await prisma.admin.findUnique({ where: { email: payload.email } })
    if (!findUser) {
      throw new NotFoundException('Admin Not found!');
    }
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  }
}