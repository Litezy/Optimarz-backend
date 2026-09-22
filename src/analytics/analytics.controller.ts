import { Body, Controller, Get, Post, Req, SetMetadata, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';
import { SuccessMessage } from 'src/decorators/success.decorator';
import { AnalyticsService } from './analytics.service';
import { TrackVisitDto } from './analytics.dto';

function extractIp(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length > 0) {
        return forwarded.split(',')[0].trim();
    }
    return req.ip;
}

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @SuccessMessage('Visit tracked')
    @Post('track')
    async track(@Body(ValidationPipe) trackVisitDto: TrackVisitDto, @Req() req: any) {
        return await this.analyticsService.trackVisit(trackVisitDto, extractIp(req));
    }

    @SuccessMessage('Visit stats fetched')
    @Get('visits')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async getStats() {
        return await this.analyticsService.getVisitStats();
    }
}
