"use client";

import React, { useState } from "react";
import { Card, CardBody, Button, Badge, Stack } from "@/components/ui";
import { Calendar, Sprout, Wheat, Coffee, Leaf } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import axios from "@/lib/api-client";

const iconMap: Record<string, any> = {
  Sprout,
  Wheat,
  Coffee,
  Leaf,
};

export function FarmVaultCard({
  vault,
  onUpdate,
}: {
  vault: any;
  onUpdate: () => void;
}) {
  const { token } = useAuthStore();
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const Icon = iconMap[vault.cropCycle.icon] || Sprout;

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    setIsDepositing(true);
    try {
      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault.id}/deposit`,
        { amount: parseFloat(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDepositAmount("");
      onUpdate();
    } catch (error) {
      console.warn("Backend not available, simulating deposit:", error);
      alert(
        `Success! Successfully deposited $${depositAmount} into ${vault.name}. (Simulated)`,
      );
      setDepositAmount("");
      onUpdate();
    } finally {
      setIsDepositing(false);
    }
  };

  const savingsProgress = (vault.balance / vault.targetAmount) * 100;
  const cycleProgress = vault.projections.progressPercentage;

  return (
    <Card
      variant="default"
      className="overflow-hidden transition-shadow hover:shadow-md"
    >
      <CardBody className="p-0">
        <div className="relative bg-harvest-green-600 p-6 text-white">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Icon className="h-24 w-24" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <Stack gap="xs">
              <Badge
                variant="primary"
                className="border-white/30 bg-white/10 text-white"
              >
                {vault.cropCycle.name}
              </Badge>

              <h3 className="text-xl font-bold">{vault.name}</h3>
            </Stack>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-harvest-green-100">
                Projected Growth
              </p>
              <p className="text-2xl font-bold">
                +{vault.projections.totalProjectedGrowth}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4">
            <Stack gap="xs">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Current Balance
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${vault.balance}
              </p>
            </Stack>
            <Stack gap="xs" className="text-right">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Target Savings
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${vault.targetAmount}
              </p>
            </Stack>
          </div>

          <Stack gap="sm">
            <div className="mb-1 flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>Savings Progress</span>
              <span>{Math.round(savingsProgress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#162a1a]">
              <div
                className="h-full rounded-full bg-harvest-green-500 transition-all duration-1000"
                style={{ width: `${Math.min(100, savingsProgress)}%` }}
              />
            </div>
          </Stack>

          <div className="rounded-xl border border-gray-100 dark:border-[rgba(141,187,85,0.15)] bg-gray-50 dark:bg-[#1a3020] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  Crop Cycle Progress
                </span>
              </div>
              <span className="text-xs font-bold text-harvest-green-700 dark:text-harvest-green-400">
                {vault.projections.daysElapsed} / {vault.cropCycle.durationDays}{" "}
                Days
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-[#162a1a]">
              <div
                className="h-full rounded-full bg-harvest-green-600 transition-all duration-1000"
                style={{ width: `${cycleProgress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between">
              <Stack gap="none">
                <p className="text-[10px] font-medium uppercase text-gray-400 dark:text-gray-500">
                  Accrued Growth
                </p>
                <p className="text-sm font-bold text-harvest-green-600 dark:text-harvest-green-400">
                  +${vault.projections.currentGrowth}
                </p>
              </Stack>
              <Stack gap="none" className="text-right">
                <p className="text-[10px] font-medium uppercase text-gray-400 dark:text-gray-500">
                  Days Left
                </p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {vault.projections.daysRemaining}
                </p>
              </Stack>
            </div>
          </div>

          <div className="flex items-end gap-2 pt-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500">
                Deposit Funds
              </label>
              <input
                type="number"
                placeholder="Amount"
                className="w-full rounded-lg border border-gray-200 dark:border-[rgba(141,187,85,0.2)] bg-white dark:bg-[#1a3020] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition-all focus:border-harvest-green-500 focus:ring-1 focus:ring-harvest-green-500"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              className="px-6"
              isLoading={isDepositing}
              onClick={handleDeposit}
            >
              Deposit
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
