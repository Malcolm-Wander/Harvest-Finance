import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiQueryHistoryService } from './ai-query-history.service';
import { CreateAiQueryHistoryDto } from './dto/ai-query-history.dto';

@Controller('ai-query-history')
@UseGuards(JwtAuthGuard)
export class AiQueryHistoryController {
  constructor(private readonly historyService: AiQueryHistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() dto: CreateAiQueryHistoryDto) {
    return this.historyService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req, @Query('search') search?: string) {
    return this.historyService.findAll(req.user.id, search);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.historyService.findOne(req.user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req, @Param('id') id: string) {
    return this.historyService.remove(req.user.id, id);
  }
}
