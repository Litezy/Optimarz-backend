import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";
import { SUCCESS_MESSAGE } from "src/decorators/success.decorator";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) { }
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const customMessage = this.reflector.get<string>(
            SUCCESS_MESSAGE,
            context.getHandler(),
        );

        return next.handle().pipe(
            map((data) => {
                // If service already returned custom format, keep it
                if (data?.status && data?.statusCode) return data;

                return {
                    status: "success",
                    error: false,
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    message: customMessage || "Request successful",
                    data,
                };
            }),
        );
    }
}
