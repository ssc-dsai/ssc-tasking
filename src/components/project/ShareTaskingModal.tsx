import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Trash2, Users } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useShareTasking } from '@/hooks/useShareTasking';
import { useSharedUsers } from '@/hooks/useSharedUsers';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SharedUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  shared_at: string;
}

interface ShareTaskingModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskingId: string;
  taskingName: string;
  onUserAdded?: () => void;
  onUserRemoved?: () => void;
}

export const ShareTaskingModal: React.FC<ShareTaskingModalProps> = ({
  isOpen,
  onClose,
  taskingId,
  taskingName,
  onUserAdded,
  onUserRemoved
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { users, isLoading: isSearching, searchUsers } = useUserSearch();
  const { addUser, removeUser, isLoading: isSharing } = useShareTasking();
  const { sharedUsers, isLoading: isLoadingSharedUsers, refetch: refetchSharedUsers } = useSharedUsers(taskingId);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (searchTerm.length >= 2) {
      const timeout = setTimeout(() => {
        searchUsers(searchTerm, taskingId);
      }, 300);
      setSearchTimeout(timeout);
    } else {
      // Clear users if search term is too short
      searchUsers('');
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, taskingId]);

  const handleAddUser = async (userId: string, userEmail: string) => {
    const result = await addUser(taskingId, userId);
    
    if (result) {
      toast({
        title: t('common.success'),
        description: `${userEmail} now has access to this tasking.`,
      });
      setSearchTerm('');
      refetchSharedUsers(); // Refresh the shared users list
      onUserAdded?.();
    } else {
      toast({
        title: t('error.generic'),
        description: t('error.generic'),
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    const result = await removeUser(taskingId, userId);
    
    if (result) {
      toast({
        title: t('common.success'),
        description: `${userEmail} no longer has access to this tasking.`,
      });
      refetchSharedUsers(); // Refresh the shared users list
      onUserRemoved?.();
    } else {
      toast({
        title: t('error.generic'),
        description: t('error.generic'),
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Users className="w-5 h-5" />
            <span>{t('tasking.shareTaskingTitle').replace('{title}', taskingName)}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {t('tasking.shareDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add User Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('common.addPeople')}</h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
              <Input
                placeholder={t('common.searchByNameOrEmail')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              />
            </div>

            {/* Search Results */}
            {searchTerm.length >= 2 && (
              <div className="border border-gray-200 dark:border-slate-600 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-slate-700">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    {t('common.loading')}
                  </div>
                ) : users.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-slate-600">
                    {users.map((user) => (
                      <div key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-600">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                              {getUserInitials(user.full_name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.display_name}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddUser(user.id, user.email)}
                          disabled={isSharing}
                          className="h-7"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          {t('common.addUser')}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Current Shared Users */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('common.peopleWithAccess')} ({isLoadingSharedUsers ? '...' : sharedUsers.length})
            </h3>
            
            {isLoadingSharedUsers ? (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">{t('common.loading')}</p>
              </div>
            ) : sharedUsers.length > 0 ? (
              <div className="space-y-2">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {getUserInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || user.email}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUser(user.id, user.email)}
                      disabled={isSharing}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                <p>No users have been shared with yet</p>
                <p className="text-xs">Search above to add people</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 