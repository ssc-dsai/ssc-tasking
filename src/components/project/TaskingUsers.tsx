import { Users } from "lucide-react";
import { useSharedUsers } from "../../hooks/useSharedUsers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLanguage } from "../../contexts/LanguageContext";

interface TaskingUsersProps {
  taskingId: string;
  isRealTasking?: boolean;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  ownerAvatarUrl?: string;
}

export const TaskingUsers = ({ 
  taskingId, 
  isRealTasking = false,
  ownerId,
  ownerEmail,
  ownerName,
  ownerAvatarUrl
}: TaskingUsersProps) => {
  const { sharedUsers, isLoading, error } = useSharedUsers(taskingId);
  const { t } = useLanguage();

  const getUserInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };
    
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 dark:text-red-400">
        <Users className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{t('error.generic')}</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  const totalUsers = (ownerId ? 1 : 0) + sharedUsers.length;

  if (totalUsers === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-slate-500" />
        <p className="text-sm">No users found for this tasking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-slate-300 mb-4">
        {t('tasking.usersCount').replace('{count}', totalUsers.toString())}
      </div>

      {/* Owner */}
      {ownerId && ownerEmail && (
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
          <Avatar className="w-8 h-8">
            <AvatarImage src={ownerAvatarUrl} />
            <AvatarFallback className="text-xs">
              {getUserInitials(ownerName || '', ownerEmail)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {ownerName || ownerEmail}
              </p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Owner
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
              {ownerEmail}
            </p>
          </div>
        </div>
      )}

      {/* Shared Users */}
      {sharedUsers.map((user) => (
          <div
            key={user.id}
          className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700"
          >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xs">
              {getUserInitials(user.full_name, user.email)}
            </AvatarFallback>
          </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Added {formatDate(user.shared_at)}
            </p>
          </div>
          </div>
        ))}
      
      {/* Empty state for shared users only */}
      {sharedUsers.length === 0 && ownerId && (
        <div className="text-center py-4 text-gray-500 dark:text-slate-400 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          <p className="text-sm">
            Use the "{t('common.addUser')}" button in the header to share this tasking.
          </p>
        </div>
      )}
    </div>
  );
};
