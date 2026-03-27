import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  Request,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExportService } from './export.service';
import { UserRole } from '../database/entities/user.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiResponse,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('Export')
@Controller('api/v1/export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * User-side export: GET /api/v1/export/users/:userId/transactions
   */
  @Get('users/:userId/transactions')
  @ApiOperation({ summary: 'Export transaction history for a user' })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel'], required: true })
  @ApiResponse({ status: 200, description: 'File download initiated' })
  async exportUserTransactions(
    @Param('userId') userId: string,
    @Query('format') format: 'csv' | 'excel',
    @Request() req: any,
    @Res() res: Response,
  ) {
    // Check authorization: user can only export their own data, admins can export anyone
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only export your own transaction history');
    }

    const data = await this.exportService.getTransactionData(userId);
    
    if (format === 'excel') {
      const buffer = await this.exportService.generateExcel(data);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transactions_${userId}_${Date.now()}.xlsx`,
      );
      return res.send(buffer);
    } else {
      const csv = await this.exportService.generateCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=transactions_${userId}_${Date.now()}.csv`,
      );
      return res.send(csv);
    }
  }

  /**
   * Admin-side export: GET /api/v1/export/admin/transactions
   */
  @Get('admin/transactions')
  @ApiOperation({ summary: 'Export all transactions (Admin only)' })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel'], required: true })
  @ApiResponse({ status: 200, description: 'File download initiated' })
  async exportAllTransactions(
    @Query('format') format: 'csv' | 'excel',
    @Request() req: any,
    @Res() res: Response,
  ) {
    // Check admin role
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can export all transactions');
    }

    const data = await this.exportService.getTransactionData();
    
    if (format === 'excel') {
      const buffer = await this.exportService.generateExcel(data);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=admin_transactions_${Date.now()}.xlsx`,
      );
      return res.send(buffer);
    } else {
      const csv = await this.exportService.generateCsv(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=admin_transactions_${Date.now()}.csv`,
      );
      return res.send(csv);
    }
  }
}
