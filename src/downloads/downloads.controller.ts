import { Body, Controller, Get, Post, SetMetadata, UseGuards, ValidationPipe } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { SuccessMessage } from 'src/decorators/success.decorator';
import { DownloadDto } from './download.tdo';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('downloads')
export class DownloadsController {
    constructor(private readonly downloadService: DownloadsService) { }

    @SuccessMessage('Download Successful')
    @Post('create')
    async createWaitlist(@Body(ValidationPipe) downloadDto: DownloadDto) {
        return await this.downloadService.downloadEbook(downloadDto)
    }

    @SuccessMessage('Fetch success')
    @Get('all')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async getWaitlists() {
        return await this.downloadService.fetchAllDownloads()
    }
}
