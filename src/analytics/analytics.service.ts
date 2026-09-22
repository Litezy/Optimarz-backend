import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import prisma from '../lib/prisma';
import { TrackVisitDto } from './analytics.dto';

function toDateOnly(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function hashVisitor(ip: string): string {
    return createHash('sha256').update(ip).digest('hex');
}

@Injectable()
export class AnalyticsService {
    async trackVisit(dto: TrackVisitDto, ip: string) {
        const visitorHash = hashVisitor(ip);
        const visitDate = toDateOnly(new Date());

        await prisma.siteVisit.upsert({
            where: { visitorHash_visitDate: { visitorHash, visitDate } },
            update: {},
            create: { visitorHash, visitDate, path: dto.path },
        });

        return { tracked: true };
    }

    async getVisitStats() {
        const today = toDateOnly(new Date());

        const startOfWeek = new Date(today);
        startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 6); // last 7 days, inclusive of today

        const startOfMonth = new Date(today);
        startOfMonth.setUTCDate(startOfMonth.getUTCDate() - 29); // last 30 days, inclusive of today

        const [todayCount, last7DaysCount, last30DaysCount, totalCount, trend] = await Promise.all([
            prisma.siteVisit.count({ where: { visitDate: today } }),
            prisma.siteVisit.count({ where: { visitDate: { gte: startOfWeek } } }),
            prisma.siteVisit.count({ where: { visitDate: { gte: startOfMonth } } }),
            prisma.siteVisit.count(),
            prisma.siteVisit.groupBy({
                by: ['visitDate'],
                _count: { _all: true },
                where: { visitDate: { gte: startOfMonth } },
                orderBy: { visitDate: 'asc' },
            }),
        ]);

        return {
            today: todayCount,
            last7Days: last7DaysCount,
            last30Days: last30DaysCount,
            total: totalCount,
            trend: trend.map((entry) => ({
                date: entry.visitDate.toISOString().slice(0, 10),
                visits: entry._count._all,
            })),
        };
    }
}
