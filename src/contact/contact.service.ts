import { BadRequestException, Injectable } from '@nestjs/common';
import { ContactDto } from './contact.tdto';
import prisma from '../lib/prisma';

@Injectable()
export class ContactService {
    async sendMessage(contactdto: ContactDto) {
        const newMsg = await prisma.contactMessage.create({
            data: {
                ...contactdto
            }
        })
        return newMsg
    }


    async findAll() {
        const allMsgs = await prisma.contactMessage.findMany(
            {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    message: true,
                    createdAt: true,
                },
            }
        )

        return allMsgs
    }

    async deleteMsg(id: number) {
        const findMsg = await prisma.contactMessage.findUnique({
            where: { id }
        })
        if (!findMsg) {
            throw new BadRequestException(`Message with the ID:${id} not found`)
        }

        await prisma.contactMessage.delete({
            where: { id }
        })
    }
}
