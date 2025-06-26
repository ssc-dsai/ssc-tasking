import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateTasking } from '@/hooks/useCreateTasking';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: { name: string; description: string; fileCount: number }) => void;
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createTaskingMutation = useCreateTasking();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (!user) throw new Error('Not authenticated');
      
      // Create the tasking using the edge function
      const result = await createTaskingMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
        category: 'personal'
      });
      
      const tasking = result.data;

      // Notify parent component
      onProjectCreated({
        name: tasking.name,
        description: tasking.description || '',
        fileCount: 0
      });

      // Show success toast
      toast({
        title: t('modal.taskingCreated'),
        description: t('modal.taskingCreatedDescription'),
      });

      // Navigate to the new tasking
      navigate(`/taskings/${tasking.id}`);

      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating tasking:', error);
      toast({
        title: t('common.error'),
        description: t('modal.taskingCreationFailed'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            {t('modal.createTasking')}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {t('modal.createTaskingDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('modal.taskingTitle')} *
              </Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('modal.taskingTitlePlaceholder')}
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('modal.taskingDescription')}
              </Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('modal.taskingDescriptionPlaceholder')}
                className="min-h-[100px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-600">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              {isSubmitting ? t('common.loading') : t('modal.create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
