
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Menu, Users, Shield } from 'lucide-react';
import SidebarConfigManagement from './sidebar-config/SidebarConfigManagement';

type SettingsView = 'main' | 'sidebar-config';

const SettingsManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<SettingsView>('main');

  const renderMainView = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        </div>
        <p className="text-muted-foreground">
          Gestiona las configuraciones generales del sistema académico.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setCurrentView('sidebar-config')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
              Configuración del Menú
            </CardTitle>
            <CardDescription>
              Gestiona qué opciones del menú lateral están disponibles para cada rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Permisos por rol
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Configuración de Usuarios
            </CardTitle>
            <CardDescription>
              Gestiona configuraciones relacionadas con usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Próximamente disponible
              </div>
              <Button variant="outline" size="sm" disabled>
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'sidebar-config':
        return (
          <div className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('main')}
              className="mb-4"
            >
              ← Volver a Configuración
            </Button>
            <SidebarConfigManagement />
          </div>
        );
      default:
        return renderMainView();
    }
  };

  return renderContent();
};

export default SettingsManagement;
