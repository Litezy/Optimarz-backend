import { ConflictException, Injectable } from '@nestjs/common';
import { DownloadDto } from './download.tdo';
import prisma from 'src/lib/prisma';

@Injectable()
export class DownloadsService {
    async downloadEbook(downloadDto: DownloadDto) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);

        const { email } = downloadDto
        const duplicateEmailThisMonth = await prisma.downloads.findFirst({
            where: {
                email,
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth,
                },
            },
        });

        if (duplicateEmailThisMonth) {
            throw new ConflictException(
                'This email has already downloaded this month'
            );
        }

        const newUser = await prisma.downloads.create({
            data: { ...downloadDto }
        })
        return newUser
    }

    async fetchAllDownloads() {
        const allDownloads = await prisma.downloads.findMany({
            select: {
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                id: true
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        return allDownloads
    }
}
