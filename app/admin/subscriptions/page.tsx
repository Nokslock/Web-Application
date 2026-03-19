import { getSubscriptionStats } from "@/app/actions/admin";
import SubscriptionAnalytics from "@/components/admin/SubscriptionAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const stats = await getSubscriptionStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Subscriptions
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Paying users, plan breakdown, and churn.
        </p>
      </div>

      <SubscriptionAnalytics stats={stats} />
    </div>
  );
}
