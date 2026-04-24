import { Test, TestingModule } from '@nestjs/testing';
import { VaultGateway } from './vault.gateway';

describe('VaultGateway', () => {
  let gateway: VaultGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VaultGateway],
    }).compile();

    gateway = module.get<VaultGateway>(VaultGateway);
    // Mock the WebSocket server
    gateway.server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit deposit event', () => {
    const data = {
      vaultId: 'v1',
      vaultName: 'Vault 1',
      asset: 'USDC',
      amount: 100,
      userId: 'u1',
      newBalance: 1000,
    };

    gateway.emitDeposit(data);

    expect(gateway.server.emit).toHaveBeenCalledWith('vault:activity:global', expect.objectContaining({
      type: 'deposit',
      vaultId: 'v1',
      amount: 100,
    }));
  });

  it('should emit harvest event', () => {
    const data = {
      vaultId: 'v1',
      vaultName: 'Vault 1',
      asset: 'STLR',
      amount: 5.5,
      userId: 'u1',
    };

    gateway.emitHarvest(data);

    expect(gateway.server.emit).toHaveBeenCalledWith('vault:activity:global', expect.objectContaining({
      type: 'harvest',
      amount: 5.5,
      asset: 'STLR',
    }));
  });
});
