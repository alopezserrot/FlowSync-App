
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { QRCodeWrapper } from './Shared';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in App.tsx will handle redirection.
    } catch (err: any) {
      const errorCode = err.code || 'unknown_error';
      setError(`Error: ${errorCode}`); // Show the specific Firebase error code
      console.error("Firebase Auth Error:", err);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-blue-500">FlowApp</h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">by FlowSync</p>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">{t('admin_sign_in')}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isLoading}>
            <div>
              <label htmlFor="email" className="sr-only">{t('username')}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:z-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('username')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{t('password')}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md -mt-px relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:z-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </fieldset>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? t('signing_in') : t('sign_in')}
            </button>
          </div>
        </form>
         <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p className="font-bold">{t('demo_logins')}:</p>
            <p><span className="font-semibold">Super Admin:</span> superadmin@example.com / password</p>
            <p><span className="font-semibold">Vendor:</span> vendor1@example.com / password</p>
            <p><span className="font-semibold">Restaurant Admin:</span> restadmin1@example.com / password</p>
        </div>
        <div className="mt-8 border-t dark:border-gray-700 pt-6 text-center">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4">{t('scan_test_customer')}</h3>
            <div className="flex justify-center">
                 <QRCodeWrapper value={`${window.location.origin}/#/restaurant/1`} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
