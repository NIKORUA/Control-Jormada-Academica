
export const getRoleDisplayName = (role: string) => {
  const roleNames = {
    superadmin: 'Super Administrador',
    admin: 'Administrador',
    director: 'Director',
    coordinador: 'Coordinador Académico',
    asistente: 'Asistente Académico',
    docente: 'Docente',
  };
  return roleNames[role as keyof typeof roleNames] || role;
};

export const getRoleBadgeVariant = (role: string) => {
  const variants = {
    superadmin: 'destructive',
    admin: 'destructive',
    director: 'default',
    coordinador: 'secondary',
    asistente: 'outline',
    docente: 'outline',
  };
  return variants[role as keyof typeof variants] || 'outline';
};

export const filterUsers = (
  users: Array<{ full_name: string; username: string; role: string; is_active: boolean }>,
  searchTerm: string,
  roleFilter: string,
  statusFilter: string
) => {
  return users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });
};
