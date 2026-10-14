import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../../stores/auth";
import { townService } from "../../api/townService";
import { errorMessage } from "../../api/client";
import type { RewardDay, RewardResult } from "../../types/api";
export function useTodayRewards() {
  const user = useAuth((state) => state.user);
  return useQuery({
    queryKey: ["rewards", user?.id],
    queryFn: townService.rewards,
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
export function useRewardAction() {
  const user = useAuth((state) => state.user);
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function run(operation: () => Promise<RewardDay | RewardResult>) {
    if (!user || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await operation();
      if (useAuth.getState().user?.id !== user.id) return;
      if ("claimId" in result) {
        client.setQueryData(["rewards", user.id], result.today);
        client.setQueryData(["wallet", user.id], { balance: result.balance });
        setMessage(
          result.replayed
            ? "이미 받은 보상이에요. 잔액을 다시 확인했어요."
            : `+${result.amount} 코인을 받았어요!`,
        );
      } else {
        client.setQueryData(["rewards", user.id], result);
        setMessage("심부름을 받았어요. 목적지로 배달해 주세요!");
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      if (useAuth.getState().user?.id === user.id)
        await Promise.all([
          client.invalidateQueries({ queryKey: ["rewards", user.id] }),
          client.invalidateQueries({ queryKey: ["wallet", user.id] }),
          client.invalidateQueries({ queryKey: ["transactions", user.id] }),
        ]);
      setBusy(false);
    }
  }
  return { busy, error, message, run };
}
