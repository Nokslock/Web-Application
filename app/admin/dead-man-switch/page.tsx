import { getDmsStats } from "@/app/actions/admin";
import DeadManSwitchAnalytics from "@/components/admin/DeadManSwitchAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminDeadManSwitchPage() {
  const stats = await getDmsStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Dead Man&apos;s Switch
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Active switches, trigger status, and expiry timelines.
        </p>
      </div>

      <DeadManSwitchAnalytics stats={stats} />
    </div>
  );
}
