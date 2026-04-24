import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { VaultsService } from './vaults.service';
import { Vault, VaultStatus } from '../database/entities/vault.entity';
import { Deposit } from '../database/entities/deposit.entity';
import { Withdrawal } from '../database/entities/withdrawal.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { VaultGateway } from '../realtime/vault.gateway';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('VaultsService', () => {
  let service: VaultsService;

  const mockVaultRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockGetRawOne = jest.fn().mockResolvedValue({ total: '1000' });

  const mockDepositRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: mockGetRawOne,
    })),
  };

  const mockWithdrawalRepository = {
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  const mockVaultGateway = {
    emitDeposit: jest.fn(),
    emitWithdrawal: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VaultsService,
        { provide: getRepositoryToken(Vault), useValue: mockVaultRepository },
        { provide: getRepositoryToken(Deposit), useValue: mockDepositRepository },
        { provide: getRepositoryToken(Withdrawal), useValue: mockWithdrawalRepository },
        { provide: DataSource, useValue: mockDataSource },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: CustomLoggerService, useValue: mockLoggerService },
        { provide: VaultGateway, useValue: mockVaultGateway },
      ],
    }).compile();

    service = module.get<VaultsService>(VaultsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withdrawFromVault', () => {
    const mockVault = {
      id: 'vault-1',
      vaultName: 'Test Vault',
      totalDeposits: 5000,
      status: VaultStatus.ACTIVE,
    };

    it('should successfully withdraw tokens', async () => {
      mockVaultRepository.findOne.mockResolvedValueOnce(mockVault);
      mockGetRawOne.mockResolvedValueOnce({ total: '1000' });
      
      const mockWithdrawal = { id: 'withdraw-1', amount: 100 };
      mockWithdrawalRepository.create.mockReturnValue(mockWithdrawal);
      
      mockDataSource.transaction.mockImplementation(async (cb) => {
        return cb({
          save: jest.fn().mockResolvedValue(mockWithdrawal),
          decrement: jest.fn(),
          findOne: jest.fn().mockResolvedValue({ ...mockVault, totalDeposits: 4900 }),
          update: jest.fn(),
        });
      });

      mockWithdrawalRepository.findOne.mockResolvedValueOnce({ ...mockWithdrawal, status: 'CONFIRMED' });

      const result = await service.withdrawFromVault('vault-1', 'user-1', 100);

      expect(result).toBeDefined();
      expect(result.withdrawal.amount).toBe(100);
      expect(mockVaultGateway.emitWithdrawal).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vault not found', async () => {
      mockVaultRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.withdrawFromVault('vault-1', 'user-1', 100)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      mockVaultRepository.findOne.mockResolvedValueOnce(mockVault);
      mockGetRawOne.mockResolvedValueOnce({ total: '50' });

      await expect(service.withdrawFromVault('vault-1', 'user-1', 100)).rejects.toThrow(BadRequestException);
    });
  });
});
