import { IsEmail, IsNotEmpty, IsNumberString, IsString } from "class-validator"

export class WaitListDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsNumberString()
    @IsNotEmpty()
    phoneNumber: string
}