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
        title: "Tasking created",
        description: "Your tasking has been created successfully.",
      });

      // Navigate to the new tasking
      navigate(`/taskings/${tasking.id}`);

      // Reset form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating tasking:', error);
      toast({
        title: "Error",
        description: "Failed to create tasking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-slate-200">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900">Create New Tasking</DialogTitle>
          <DialogDescription className="text-slate-600">
            Set up a new tasking to organize your work and generate AI-powered briefing notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-sm font-medium text-slate-700">
                Tasking Name *
              </Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tasking name..."
                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this tasking is about..."
                className="min-h-[100px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Tasking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
