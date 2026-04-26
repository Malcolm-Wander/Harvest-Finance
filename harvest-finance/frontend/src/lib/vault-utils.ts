import { Vault, RiskLevel } from '@/types/vault';

export type SortKey = 'name' | 'apy' | 'tvl' | 'riskLevel';
export type SortDirection = 'asc' | 'desc';

export const sortVaults = (
  vaults: Vault[],
  key: SortKey,
  direction: SortDirection
): Vault[] => {
  const riskOrder: Record<RiskLevel, number> = {
    Low: 1,
    Medium: 2,
    High: 3,
  };

  return [...vaults].sort((a, b) => {
    let comparison = 0;

    switch (key) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'apy':
        comparison = (a.apy || 0) - (b.apy || 0);
        break;
      case 'tvl':
        comparison = (a.tvl || 0) - (b.tvl || 0);
        break;
      case 'riskLevel':
        comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        break;
      default:
        comparison = 0;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
};

export const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getRiskVariant = (riskLevel: RiskLevel): 'success' | 'warning' | 'error' => {
  switch (riskLevel) {
    case 'Low':
      return 'success';
    case 'Medium':
      return 'warning';
    case 'High':
      return 'error';
    default:
      return 'success';
  }
};
