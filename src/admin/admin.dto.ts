import { PartialType } from '@nestjs/mapped-types'
import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator'
export class CreateAdminDto {
    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    fullname: string

    @IsString()
    password: string
}


export class LoginDto {
    @IsEmail()
    email: string

    @IsString()
    password: string
}

export class UpdateAdminDto  {
    @IsOptional()
    @IsEmail()
    newEmail?: string

    @IsEmail()
    oldEmail: string

    @IsString()
    @IsNotEmpty()
    fullname: string


    @IsOptional()
    @IsString()
    password?: string
 }
