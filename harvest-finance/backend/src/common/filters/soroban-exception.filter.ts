import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class SorobanExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SorobanExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Defer to standard NestJS handling for existing HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      return response.status(status).json(exception.getResponse());
    }

    const errMessage = exception instanceof Error ? exception.message : String(exception);
    
    // Identify Soroban/Rust specific error signatures
    const isSorobanError = errMessage.includes('HostError') || 
                           errMessage.includes('Soroban') || 
                           errMessage.includes('stellar') || 
                           errMessage.includes('tx_failed');

    if (isSorobanError) {
      this.logger.error(`Soroban Exception Caught: ${errMessage}`, exception instanceof Error ? exception.stack : '');

      // Translate cryptic Rust/Soroban errors into friendly UI messages
      let cleanMessage = 'A blockchain transaction error occurred.';
      if (errMessage.toLowerCase().includes('timeout')) {
        cleanMessage = 'The transaction timed out. Please try again.';
      } else if (errMessage.includes('InvalidInput')) {
        cleanMessage = 'Invalid input provided to the smart contract.';
      } else if (errMessage.includes('Auth') || errMessage.includes('auth_failed')) {
        cleanMessage = 'Transaction authorization failed. Please check your signature.';
      }

      return response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'SorobanContractError',
        message: cleanMessage,
        details: process.env.NODE_ENV === 'development' ? errMessage : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Fallback for generic, non-Soroban unhandled server errors
    this.logger.error(`Unhandled Exception: ${errMessage}`, exception instanceof Error ? exception.stack : '');
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal server error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}