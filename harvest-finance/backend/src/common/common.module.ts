/**
 * Common Module
 *
 * Provides shared services, interceptors, and utilities
 * including API versioning, logging, and error handling
 */

import { Module } from '@nestjs/common';
import { VersionService } from './services/version.service';
import { VersionInfoController } from './controllers/version-info.controller';

@Module({
  providers: [VersionService],
  controllers: [VersionInfoController],
  exports: [VersionService],
})
export class CommonModule {}
