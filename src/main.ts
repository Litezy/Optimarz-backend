import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import rateLimit from "express-rate-limit";
import fileUpload from "express-fileupload";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //added a comment

  app.use(helmet());

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      'https://optimarzproperties.com',
      'https://www.optimarzproperties.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new AllExceptionsFilter());

  // Strict limiter for auth routes
  // app.use('/api/v1', rateLimit({
  //   windowMs: 15 * 60 * 1000,
  //   max: 10,
  //   message: { statusCode: 429, message: 'Too many login attempts' }
  // }));

  // General limiter
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.use(fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    createParentPath: true,
    useTempFiles: false,
    safeFileNames: true,
    preserveExtension: true,
  }));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();