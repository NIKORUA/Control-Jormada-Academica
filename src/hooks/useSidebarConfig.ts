
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SidebarOption, SidebarPermission, SidebarOptionWithPermissions, UserRole } from '@/types/sidebar';
import { toast } from 'sonner';

export const useSidebarOptions = () => {
  return useQuery({
    queryKey: ['sidebar-options'],
    queryFn: async (): Promise<SidebarOptionWithPermissions[]> => {
      console.log('Fetching sidebar options...');
      
      const { data: options, error: optionsError } = await supabase
        .from('sidebar_options')
        .select('*')
        .order('title');

      if (optionsError) {
        console.error('Error fetching sidebar options:', optionsError);
        throw optionsError;
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('sidebar_permissions')
        .select('*');

      if (permissionsError) {
        console.error('Error fetching sidebar permissions:', permissionsError);
        throw permissionsError;
      }

      console.log('Sidebar options fetched:', options);
      console.log('Sidebar permissions fetched:', permissions);

      return (options || []).map(option => ({
        ...option,
        permissions: (permissions || []).filter(p => p.option_id === option.id)
      }));
    }
  });
};

export const useSidebarPermissions = (userRole?: UserRole) => {
  return useQuery({
    queryKey: ['sidebar-permissions', userRole],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (!userRole) {
        console.log('No user role provided for sidebar permissions');
        return {};
      }

      console.log('Fetching sidebar permissions for role:', userRole);

      const { data, error } = await supabase
        .from('sidebar_permissions')
        .select(`
          enabled,
          sidebar_options!inner(option_key)
        `)
        .eq('role', userRole);

      if (error) {
        console.error('Error fetching sidebar permissions:', error);
        throw error;
      }

      console.log('Raw sidebar permissions data:', data);

      const permissions: Record<string, boolean> = {};
      (data || []).forEach((item: any) => {
        if (item.sidebar_options && item.sidebar_options.option_key) {
          permissions[item.sidebar_options.option_key] = item.enabled;
        }
      });

      console.log('Processed sidebar permissions:', permissions);
      return permissions;
    },
    enabled: !!userRole
  });
};

export const useUpdateSidebarPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      optionId, 
      role, 
      enabled 
    }: { 
      optionId: string; 
      role: UserRole; 
      enabled: boolean; 
    }) => {
      console.log('Updating sidebar permission:', { optionId, role, enabled });
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('sidebar_permissions')
        .upsert({
          option_id: optionId,
          role,
          enabled,
          configured_by: user?.id
        }, {
          onConflict: 'option_id,role'
        });

      if (error) {
        console.error('Error updating sidebar permission:', error);
        throw error;
      }
      
      console.log('Sidebar permission updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar-options'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-permissions'] });
      toast.success('Permisos actualizados correctamente');
    },
    onError: (error) => {
      console.error('Error updating sidebar permission:', error);
      toast.error('Error al actualizar los permisos');
    }
  });
};
