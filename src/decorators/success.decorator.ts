// src/common/decorators/success-message.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SUCCESS_MESSAGE = "SUCCESS_MESSAGE";
export const SuccessMessage = (message: string) => SetMetadata(SUCCESS_MESSAGE, message);
