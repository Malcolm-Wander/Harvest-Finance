'use client';

import { useEffect, useMemo, useState } from 'react';
import { 
  Bot, 
  Database, 
  Leaf, 
  RefreshCcw, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';
import { 
  Badge, 
  Button, 
  Card, 
  CardBody,
  MetricCardSkeleton,
} from '@/components/ui';

import { AIAssistantChat } from '@/components/ai-assistant';
import { 
  VaultOverview, 
  VaultActivityFeed, 
  ConnectivityBanner, 
  CropRecommendationPanel, 
  FarmActivityMap, 
  WeatherWidget, 
  CropInsurancePanel 
} from '@/components/dashboard';

import { 
  MilestoneNotification, 
  SeasonalTipsList 
} from '@/components/seasonal-tips';

import { useAIAssistantStore } from '@/hooks/useAIAssistant';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSync } from '@/hooks/useSync';
import { 
  loadDashboardSnapshot, 
  saveDashboardSnapshot 
} from '@/lib/offline-support';

const defaultTransactions = [
  {
    id: "tx-1",
    type: "Deposit",
    amount: 250,
    status: "Synced",
    createdAt: "2026-03-29T07:30:00.000Z",
  },
  {
    id: "tx-2",
    type: "Reward",
    amount: 38,
    status: "Completed",
    createdAt: "2026-03-28T12:15:00.000Z",
  },
];

export default function DashboardPage() {
  const openChat = useAIAssistantStore((state) => state.openChat);
  const { token } = useAuthStore();
  const { isOnline, isSyncing, queuedCount, sync, queueAction } = useSync();
  const [snapshotUpdatedAt, setSnapshotUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    openChat();
  }, [openChat]);

  useEffect(() => {
    const snapshot = loadDashboardSnapshot();
    setSnapshotUpdatedAt(snapshot?.updatedAt ?? null);
  }, []);

  const snapshot = useMemo(() => {
    return (
      loadDashboardSnapshot() ?? {
        updatedAt: new Date().toISOString(),
        vaultBalance: 18240,
        totalDeposits: 14750,
        totalRewards: 3490,
        queuedActions: 0,
        activeVaults: 4,
        recentTransactions: defaultTransactions,
      }
    );
  }, []);

  useEffect(() => {
    const updatedAt = new Date().toISOString();
    saveDashboardSnapshot({
      ...snapshot,
      queuedActions: queuedCount,
      updatedAt,
    });
    setSnapshotUpdatedAt(updatedAt);
  }, [queuedCount, snapshot]);

  const aiContext = {
    selectedCrop: "Maize",
    currentSeason: "Rainy season",
    vaultBalance: snapshot.vaultBalance,
    totalDeposits: snapshot.totalDeposits,
    totalRewards: snapshot.totalRewards,
    vaultTarget: 25000,
    progressPercent: Math.round((snapshot.vaultBalance / 25000) * 100),
  };

  const quickActions = [
    {
      title: "Vault balance",
      value: `$${snapshot.vaultBalance.toLocaleString()}`,
      helper: "Available in offline cache",
      icon: Wallet,
    },
    {
      title: "Total deposits",
      value: `$${snapshot.totalDeposits.toLocaleString()}`,
      helper: "Includes synced and queued activity",
      icon: Database,
    },
    {
      title: "Total rewards",
      value: `$${snapshot.totalRewards.toLocaleString()}`,
      helper: "Seasonal rewards across active vaults",
      icon: TrendingUp,
    },
    {
      title: "Active vaults",
      value: `${snapshot.activeVaults}`,
      helper: "Mobile-friendly overview",
      icon: Leaf,
    },
  ];

  const queueDepositDemo = async () => {
    await queueAction(
      "http://localhost:3001/api/v1/vaults/vault-1/deposit",
      "POST",
      { amount: 150 }
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-6 md:pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge variant="primary" className="mb-2 w-fit">
            Farm Vault Dashboard
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Mobile-ready farming intelligence
          </h1>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-gray-600 dark:text-gray-400">
            Track vault health, request crop suggestions, explore live regional
            activity, and keep working even when the network drops.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCcw className="h-4 w-4" />}
            onClick={sync}
            isLoading={isSyncing}
            className="text-sm"
          >
            Refresh sync
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Bot className="h-4 w-4" />}
            onClick={queueDepositDemo}
            className="text-sm"
          >
            Queue demo deposit
          </Button>
        </div>
      </div>

      <ConnectivityBanner
        isOnline={isOnline}
        queuedActions={queuedCount}
        lastUpdated={snapshotUpdatedAt}
        isSyncing={isSyncing}
        onSync={sync}
      />

      <WeatherWidget />
      <MilestoneNotification />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isSyncing
          ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
          : quickActions.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} variant="default" className="hover:shadow-md transition-shadow">
              <CardBody className="space-y-4 p-4 md:p-5">
                <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-full bg-harvest-green-50 dark:bg-harvest-green-900/40 text-harvest-green-700 dark:text-harvest-green-300">
  <Icon className="h-4 w-4 md:h-5 md:w-5" />
</div>
                  <Badge variant="success" size="sm" isPill>
                    Cached
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {card.title}
                  </p>
   <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                    {card.helper}
                  </p>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <CropRecommendationPanel isOnline={isOnline} />
          <FarmActivityMap />
          <VaultOverview />
        </div>
        <div className="space-y-6">
          <Card variant="default" className="h-fit">
            <CardBody className="space-y-5 p-4 md:p-6">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                  Recent vault activity
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Cached locally so the latest dashboard view remains visible
                  offline.
                </p>
              </div>
              <div className="space-y-3">
                {snapshot.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-[rgba(141,187,85,0.15)] bg-gray-50 dark:bg-[#1a3020] px-3 md:px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {transaction.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${transaction.amount}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <CropInsurancePanel />
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-6">
          <VaultActivityFeed />
        </div>

        <div className="border-t border-gray-200 dark:border-[rgba(141,187,85,0.12)] pt-6">
          <SeasonalTipsList showFilters />
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistantChat context={aiContext} />
    </div>
  );
}
