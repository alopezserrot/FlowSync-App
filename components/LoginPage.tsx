
import React, { useState } from 'react';
import { QRCodeWrapper } from './Shared';
import { useLanguage } from '../i18nContext';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError(t('invalid_credentials'));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-secondary mb-2">FlowApp</h2>
        <p className="text-center text-gray-600 mb-6">{t('admin_sign_in')}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset disabled={isLoading}>
            <div>
              <label htmlFor="username" className="sr-only">{t('username')}</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-600 bg-secondary placeholder-gray-400 text-white focus:z-10 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder={t('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                className="appearance-none rounded-b-md -mt-px relative block w-full px-3 py-2 border border-gray-600 bg-secondary placeholder-gray-400 text-white focus:z-10 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-orange-300"
            >
              {isLoading ? t('signing_in') : t('sign_in')}
            </button>
          </div>
        </form>
         <div className="mt-6 text-xs text-gray-500 text-center">
            <p className="font-bold">{t('demo_logins')}:</p>
            <p><span className="font-semibold">Super Admin:</span> superadmin / password</p>
            <p><span className="font-semibold">Vendor:</span> vendor1 / password</p>
            <p><span className="font-semibold">Restaurant Admin:</span> restadmin1 / password</p>
        </div>
        <div className="mt-8 border-t pt-6 text-center">
            <h3 className="font-bold text-secondary mb-4">{t('scan_test_customer')}</h3>
            <div className="flex justify-center">
                <QRCodeWrapper value={`${window.location.href.split('#')[0]}#restaurant/1`} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
