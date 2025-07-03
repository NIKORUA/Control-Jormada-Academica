
import React from 'react';

const AuthHeader: React.FC = () => {
  return (
    <div className="text-center">
      <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
        Sistema Académico
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Inicia sesión o registra una nueva cuenta
      </p>
    </div>
  );
};

export default AuthHeader;
