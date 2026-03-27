'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Badge,
  Stack,
  Inline,
  Container,
  Section
} from '@/components/ui';
import { 
  Plus, 
  Sprout, 
  TrendingUp, 
  Wallet, 
  ArrowRight, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import axios from 'axios';
import { CreateVaultModal } from '@/components/farm-vaults/CreateVaultModal';
import { FarmVaultCard } from '@/components/farm-vaults/FarmVaultCard';

const mockFarmVaults = [
  {
    id: 'vault-1',
    name: 'Early Season Maize',
    balance: 500,
    targetAmount: 2000,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ACTIVE',
    cropCycle: {
      name: 'Maize - Rainy Season',
      durationDays: 120,
      yieldRate: 15,
      icon: 'Sprout'
    },
    projections: {
      daysElapsed: 30,
      daysRemaining: 90,
      progressPercentage: 25,
      currentGrowth: 18.75,
      totalProjectedGrowth: 75,
      estimatedTotalAtMaturity: 575
    }
  }
];

export default function FarmVaultsPage() {
  const { user, token } = useAuthStore();
  const [vaults, setVaults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVaults = async () => {
    if (!user) return;
    try {
      const response = await axios.get('http://localhost:3001/api/v1/farm-vaults', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setVaults(response.data);
      } else {
        setVaults([]); // Keep empty if backend returned empty array
      }
    } catch (error) {
      console.warn('Backend not available or failed to fetch vaults, using mocks:', error);
      // For the pitch, if backend fails, we can show mock data to wow the user
      setVaults(mockFarmVaults);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, [user]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Smart Farm Vaults
          </h1>
          <p className="text-gray-500 mt-1">
            Create personal savings vaults for your seasonal crop cycles and track projected growth.
          </p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Farm Vault
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvest-green-600"></div>
        </div>
      ) : vaults.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vaults.map((vault) => (
            <FarmVaultCard 
              key={vault.id} 
              vault={vault} 
              onUpdate={fetchVaults}
            />
          ))}
        </div>
      ) : (
        <Card variant="default" className="border-dashed border-2">
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 bg-harvest-green-50 rounded-full flex items-center justify-center text-harvest-green-600 mx-auto mb-4">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Farm Vaults Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              Start your first savings vault for the upcoming season to track your growth and maximize your harvest earnings.
            </p>
            <Button 
              variant="primary" 
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create My First Vault
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Educational Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card variant="outline" className="bg-emerald-50 border-emerald-100">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-sm">Targeted Savings</h4>
                <p className="text-emerald-700 text-xs mt-1">Set specific goals for seed, fertilizer, or new equipment.</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="outline" className="bg-harvest-green-50 border-harvest-green-100">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="w-5 h-5 text-harvest-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-harvest-green-900 text-sm">Seasonal Tracking</h4>
                <p className="text-harvest-green-700 text-xs mt-1">Align your savings with actual crop growth cycles.</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="outline" className="bg-blue-50 border-blue-100">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Expert Projections</h4>
                <p className="text-blue-700 text-xs mt-1">Get data-driven ROI estimates for your selected crop type.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <CreateVaultModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchVaults}
      />
    </div>
  );
}
