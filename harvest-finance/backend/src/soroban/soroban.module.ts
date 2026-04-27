import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SorobanEvent } from '../database/entities/soroban-event.entity';
import { AuthModule } from '../auth/auth.module';
import { SorobanController } from './soroban.controller';
import { SorobanIndexerService } from './soroban-indexer.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([SorobanEvent]),
    AuthModule,
  ],
  controllers: [SorobanController],
  providers: [SorobanIndexerService],
  exports: [SorobanIndexerService],
})
export class SorobanModule {}
