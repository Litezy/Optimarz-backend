import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdminService, TokenResponse } from './admin.service';
import { CreateAdminDto, LoginDto, UpdateAdminDto } from './admin.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../guards/role.guard';
import { SetMetadata } from '@nestjs/common';
import { SuccessMessage } from 'src/decorators/success.decorator';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('test-public')
    testPublic() {
        return { message: 'This should work without token!' };
    }

    // ✅ SPECIFIC ROUTES FIRST
    @SuccessMessage('Fetch success')
    @Get('all-admins') // ← This should come BEFORE :email
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async findAll() {
        return await this.adminService.findAll();
    }

    @SuccessMessage('Admin create successfully')
    @Post('create-admin')
    createAdmin(@Body(ValidationPipe) createAdminDto: CreateAdminDto) {
        return this.adminService.createAdmin(createAdminDto)
    }

    @SuccessMessage('Login successful')
    @Post('login')
    loginAdmin(@Body(ValidationPipe) loginDto: LoginDto): Promise<TokenResponse> {
        return this.adminService.loginAdmin(loginDto)
    }

    @SuccessMessage('Admin updated successfully')
    @Patch('update-admin')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    updateAdmin(@Body(ValidationPipe) updateAdminDto: UpdateAdminDto) {
        return this.adminService.updateAdmin(updateAdminDto)
    }

    // ✅ PARAMETERIZED ROUTES LAST
    @SuccessMessage('fetch success')
    @Get(':email') // ← This should come AFTER all specific routes
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async findOne(@Param('email') email: string) {
        return await this.adminService.findByEmail(email);
    }

    @SuccessMessage('Admin deleted successfully')
    @Delete(':email')
    @UseGuards(AuthGuard('jwt'), RoleGuard)
    @SetMetadata('roles', ['admin'])
    async remove(@Param('email') email: string) {
        return await this.adminService.deleteAdmin(email);
    }
}