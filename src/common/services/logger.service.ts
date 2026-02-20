import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements NestLoggerService {
  private logDir = path.join(process.cwd(), 'logs');

  constructor() {
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(message: string, context?: string) {
    this.writeLog('INFO', message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.writeLog('ERROR', message, context, trace);
  }

  warn(message: string, context?: string) {
    this.writeLog('WARN', message, context);
  }

  debug(message: string, context?: string) {
    this.writeLog('DEBUG', message, context);
  }

  verbose(message: string, context?: string) {
    this.writeLog('VERBOSE', message, context);
  }

  private writeLog(level: string, message: string, context?: string, trace?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${context ? `[${context}] ` : ''}${message}${trace ? `\n${trace}` : ''}\n`;
    
    // Console output
    console.log(logMessage);

    // File output
    const logFile = path.join(this.logDir, `${level.toLowerCase()}-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logMessage);
  }
}