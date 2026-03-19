import { getUsersList } from "@/app/actions/admin";
import { getNotificationHistory } from "@/app/actions/notifications";
import NotificationComposer from "@/components/admin/NotificationComposer";
import NotificationHistory from "@/components/admin/NotificationHistory";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const [users, notificationHistory] = await Promise.all([
    getUsersList(1, 100),
    getNotificationHistory(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
          Notifications
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Send broadcasts, target users, and review history.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <NotificationComposer users={users} />
        </div>
        <div className="xl:col-span-2">
          <NotificationHistory notifications={notificationHistory} />
        </div>
      </div>
    </div>
  );
}
