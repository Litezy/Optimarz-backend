import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, SetMetadata, UseGuards, ValidationPipe } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitListDto } from './waitlist.dto';
import { SuccessMessage } from 'src/decorators/success.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('waitlist')
export class WaitlistController {
    constructor(private readonly waitListService: WaitlistService) { }

    @SuccessMessage('Successfully added to waitlist')
    @Post('create')
    async createWaitlist(@Body(ValidationPipe) waitlistDto: WaitListDto) {
        return await this.waitListService.createWaitlist(waitlistDto)
    }

    @SuccessMessage('Fetch success')
    @Get('all')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async getWaitlists() {
        return await this.waitListService.findAll()
    }


    @SuccessMessage('User deleted from waitlist')
    @Delete('delete/:id')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    deleteWaitlist(@Param('id', ParseIntPipe) id: number) {
        return this.waitListService.deleteUserFromWaitlist(id)
    }
}
