"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Badge,
  Alert,
} from "@/components/ui";
import { parseStellarError } from "@/lib/errors/stellar-errors";
import { Wallet, ArrowDownLeft, AlertTriangle } from "lucide-react";
import axios from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { enqueueOfflineAction } from "@/lib/offline-support";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: any;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  vault,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError(t('modals.valid_amount_error'));
      return;
    }

    if (Number(amount) > (Number(vault?.balance) || 0)) {
      setError(t('modals.insufficient_balance'));
      return;
    }


    setIsLoading(true);
    setError(null);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineAction({
          type: "withdraw",
          endpoint: `http://localhost:3001/api/v1/farm-vaults/${vault.id}/withdraw`,
          payload: { amount: Number(amount) },
        });
        onSuccess?.();
        onClose();
        setAmount("");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/v1/farm-vaults/${vault.id}/withdraw`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onSuccess?.();
      onClose();
      setAmount("");
    } catch (err: any) {
      console.error("Withdraw failed:", err);
      const parsed = parseStellarError(err);
      setError(parsed.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isEarlyWithrawal = (vault?.projections?.progressPercentage || 0) < 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title={t('modals.withdraw_title')} onClose={onClose} />
      <ModalBody>
        <Stack gap="lg">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                {t('modals.from_vault')}
              </p>
              <h4 className="font-bold text-gray-900">{vault?.name}</h4>
            </div>
            <Badge variant="error">
              {t('modals.season_progress', { progress: vault?.projections?.progressPercentage ?? 0 })}
            </Badge>
          </div>

          {error && (
            <Alert 
              variant="error" 
              description={error} 
              isClosable 
              onClose={() => setError(null)} 
            />
          )}

          <Input
            label={t('modals.amount_label')}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<Wallet className="w-4 h-4 text-gray-400" />}
            error={error || undefined}
            type="number"
            autoFocus
          />

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-500">
            <p className="mb-1 flex justify-between">
              <span>{t('modals.available_balance')}:</span>
              <span className="font-bold text-gray-900">${vault?.balance ?? '0.00'}</span>
            </p>

            <p className="mt-2 text-xs text-gray-500">
              {t('modals.offline_note')}
            </p>
          </div>

          {isEarlyWithrawal && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                {t('modals.early_withdrawal_warning')}
              </p>
            </div>
          )}
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
          {t('modals.cancel')}
        </Button>
        <Button
          variant="danger"
          onClick={handleWithdraw}
          isLoading={isLoading}
          leftIcon={<ArrowDownLeft className="w-4 h-4" />}
        >
          {t('modals.confirm_withdraw')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
