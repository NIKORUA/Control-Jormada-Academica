
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, UserCog, UserX, UserCheck } from 'lucide-react';
import { UserProfile } from './types';

interface UserActionsMenuProps {
  user: UserProfile;
  onResetPassword: (user: UserProfile) => void;
  onChangeRole: (user: UserProfile) => void;
  onToggleStatus: (user: UserProfile) => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({
  user,
  onResetPassword,
  onChangeRole,
  onToggleStatus,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onResetPassword(user)}>
          <Key className="h-4 w-4 mr-2" />
          Resetear Contraseña
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChangeRole(user)}>
          <UserCog className="h-4 w-4 mr-2" />
          Cambiar Rol
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
          {user.is_active ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Desactivar Usuario
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activar Usuario
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActionsMenu;
