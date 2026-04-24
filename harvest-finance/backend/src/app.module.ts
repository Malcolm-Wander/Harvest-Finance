import { CacheModule } from '@nestjs/cache-manager';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsModule } from './achievements/achievements.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AiQueryHistoryModule } from './ai-query-history/ai-query-history.module';
import { UsersModule } from './users/users.module';
import { VaultsModule } from './vaults/vaults.module';
import { FarmIntelligenceModule } from './farm-intelligence/farm-intelligence.module';
import { ExportModule } from './export/export.module';
import { FarmVaultsModule } from './farm-vaults/farm-vaults.module';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';
import { VerificationModule } from './verification/verification.module';
import { DatabaseModule } from './database/database.module';
import { RewardsModule } from './rewards/rewards.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { InsuranceModule } from './insurance/insurance.module';

import {
  Achievement,
  CreditScore,
  CropCycle,
  Deposit,
  FarmVault,
  Notification,
  Order,
  Reward,
  Transaction,
  User,
  Verification,
  Vault,
  VaultDeposit,
  Withdrawal,
  InsurancePlan,
  InsuranceSubscription,
} from './database/entities';

import { CreateInitialSchema1700000000000 } from './database/migrations/1700000000000-CreateInitialSchema';
import { CreateVaultsAndDeposits1700000000003 } from './database/migrations/1700000000003-CreateVaultsAndDeposits';
import { CreateAchievements1700000000004 } from './database/migrations/1700000000004-CreateAchievements';
import { CreateRewards1700000000005 } from './database/migrations/1700000000005-CreateRewards';
import { CreateNotifications1700000000006 } from './database/migrations/1700000000006-CreateNotifications';
import { CreateWithdrawals1700000000007 } from './database/migrations/1700000000007-CreateWithdrawals';
import { CreateFarmVaults1700000000008 } from './database/migrations/1700000000008-CreateFarmVaults';
import { CreateInsurance1700000000009 } from './database/migrations/1700000000009-CreateInsurance';
import { AddInsuranceNotificationType1700000000010 } from './database/migrations/1700000000010-AddInsuranceNotificationType';

@Module({
  imports: [
    AiQueryHistoryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Order,
          Transaction,
          Verification,
          CreditScore,
          Vault,
          Deposit,
          Achievement,
          Reward,
          Notification,
          Withdrawal,
          CropCycle,
          FarmVault,
          InsurancePlan,
          InsuranceSubscription,
          VaultDeposit,
        ],
        migrations: [
          CreateInitialSchema1700000000000,
          CreateVaultsAndDeposits1700000000003,
          CreateAchievements1700000000004,
          CreateRewards1700000000005,
          CreateNotifications1700000000006,
          CreateWithdrawals1700000000007,
          CreateFarmVaults1700000000008,
          CreateInsurance1700000000009,
          AddInsuranceNotificationType1700000000010,
        ],
        synchronize: false,
        migrationsRun: false,
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 600,
      max: 100,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    VaultsModule,
    HealthModule,
    OrdersModule,
    VerificationModule,
    DatabaseModule,
    FarmIntelligenceModule,
    AchievementsModule,
    RewardsModule,
    NotificationsModule,
    AdminModule,
    ExportModule,
    FarmVaultsModule,
    InsuranceModule,
    RealtimeModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
