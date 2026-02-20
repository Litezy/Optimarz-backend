import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { WaitListDto } from './waitlist.dto';
import prisma from '../lib/prisma';

@Injectable()
export class WaitlistService {
    async createWaitlist(waitlistDto: WaitListDto) {
        const { email } = waitlistDto
        const duplicateEmail = await prisma.waitlist.findUnique({
            where: { email }
        })
        if (duplicateEmail) {
            throw new ConflictException('Email already used');
        }
        const newUser = await prisma.waitlist.create({
            data: { ...waitlistDto }
        })
        return newUser
    }

    async findAll() {
        const allInWait = await prisma.waitlist.findMany({
            select: {
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                createdAt: true,
                id: true
            }
        })
        return allInWait
    }

    async deleteUserFromWaitlist(id: number) {
        const findUser = await prisma.waitlist.findUnique({
            where: { id }
        })
        if (!findUser) {
            throw new BadRequestException(`User with the ID:${id} not found in waitlist`)
        }

        await prisma.waitlist.delete({
            where: { id }
        })
       
    }
}
