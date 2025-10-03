'use client';

import TestSignUpForm from '../../components/TestSignUpForm';

export default function TestSignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Test Formulaire d'Inscription
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test du formulaire d'inscription avec le champ "Nom complet"
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <TestSignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
