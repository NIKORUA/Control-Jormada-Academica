
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AuthErrorAlertProps {
  error: string;
}

const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <Alert className="mt-4" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default AuthErrorAlert;
