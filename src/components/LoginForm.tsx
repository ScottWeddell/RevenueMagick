import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Building, User, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    businessName: '',
    businessWebsite: '',
    industry: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (mode === 'reset') {
      setIsLoading(true);
      setError('');
      setMessage('');

      try {
        const { error } = await resetPassword(credentials.email);
        
        if (error) {
          setError(error.message);
          onError(error.message);
        } else {
          setMessage('Password reset email sent! Check your inbox.');
          setTimeout(() => setMode('login'), 3000);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to send reset email';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!credentials.password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (!credentials.firstName.trim() || !credentials.businessName.trim()) {
        setError('Please fill in all required fields');
        return;
      }
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        const { data, error } = await signIn(credentials.email, credentials.password);
        
        if (error) {
          setError(error.message);
          onError(error.message);
        } else if (data.user) {
          // Create user object for the app
          const user = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || 
                  `${data.user.user_metadata?.first_name || ''} ${data.user.user_metadata?.last_name || ''}`.trim() || 
                  data.user.email.split('@')[0],
            role: 'admin',
            supabase_user: data.user
          };
          
          onSuccess(user);
        }
      } else {
        // Signup mode
        const userData = {
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          business_name: credentials.businessName,
          business_website: credentials.businessWebsite,
          industry: credentials.industry,
          full_name: `${credentials.firstName} ${credentials.lastName}`.trim()
        };

        const { data, error } = await signUp(credentials.email, credentials.password, userData);
        
        if (error) {
          setError(error.message);
          onError(error.message);
        } else if (data.user) {
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed
            const user = {
              id: data.user.id,
              email: data.user.email,
              name: userData.full_name || data.user.email.split('@')[0],
              role: 'admin',
              supabase_user: data.user
            };
            
            onSuccess(user);
          } else {
            // Email confirmation required
            setMessage('Please check your email and click the confirmation link to complete your registration.');
            setTimeout(() => setMode('login'), 5000);
          }
        }
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      const errorMessage = error.message || `${mode === 'login' ? 'Login' : 'Signup'} failed. Please try again.`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (newMode: 'login' | 'signup' | 'reset') => {
    setMode(newMode);
    setError('');
    setMessage('');
    setCredentials({
      email: credentials.email, // Keep email when switching modes
      password: '',
      firstName: '',
      lastName: '',
      businessName: '',
      businessWebsite: '',
      industry: ''
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-600">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Revenue Magick
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your business account'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        {/* Mode Toggle */}
        {mode !== 'reset' && (
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => toggleMode('login')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'login'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => toggleMode('signup')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'signup'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    {message}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field (not shown for reset mode) */}
            {mode !== 'reset' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Signup Fields */}
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={credentials.firstName}
                        onChange={(e) => setCredentials({ ...credentials, firstName: e.target.value })}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={credentials.lastName}
                      onChange={(e) => setCredentials({ ...credentials, lastName: e.target.value })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={credentials.businessName}
                      onChange={(e) => setCredentials({ ...credentials, businessName: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your business name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                    Business Website
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessWebsite"
                      name="businessWebsite"
                      type="url"
                      value={credentials.businessWebsite}
                      onChange={(e) => setCredentials({ ...credentials, businessWebsite: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={credentials.industry}
                    onChange={(e) => setCredentials({ ...credentials, industry: e.target.value })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="consulting">Consulting</option>
                    <option value="agency">Marketing Agency</option>
                    <option value="retail">Retail</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'login' && 'Signing in...'}
                  {mode === 'signup' && 'Creating account...'}
                  {mode === 'reset' && 'Sending email...'}
                </div>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Reset Email'}
                </>
              )}
            </button>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => toggleMode('reset')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            )}
            
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => toggleMode('login')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to sign in
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 