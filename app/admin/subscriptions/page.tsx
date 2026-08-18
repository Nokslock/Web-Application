import { getSubscriptionStats } from "@/app/actions/admin";
import SubscriptionAnalytics from "@/components/admin/SubscriptionAnalytics";
import GiftPremium from "@/components/admin/GiftPremium";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubscriptionAnalytics stats={stats} />
        <GiftPremium />
      </div>
    </div>
  );
}
