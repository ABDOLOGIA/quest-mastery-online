
import React from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface ProfileActionsProps {
  canEdit: boolean;
  isEditing: boolean;
  isLoading: boolean;
  editFormValid: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  canEdit,
  isEditing,
  isLoading,
  editFormValid,
  onEdit,
  onSave,
  onCancel
}) => {
  if (!canEdit) return null;

  return (
    <div className="flex space-x-2 pt-4">
      {isEditing ? (
        <>
          <Button 
            onClick={onSave}
            disabled={isLoading || !editFormValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button 
          onClick={onEdit}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          Edit Profile
        </Button>
      )}
    </div>
  );
};

export default ProfileActions;
