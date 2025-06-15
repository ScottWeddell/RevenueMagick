import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Building, User, Globe } from 'lucide-react';
import { apiClient } from '../lib/api';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onError: (error: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError('Please fill in all required fields');
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

    try {
      let response;
      
      if (mode === 'login') {
        response = await apiClient.login(credentials.email, credentials.password);
        
        console.log('Login response:', response); // Debug log
        
        // Store the token
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('auth_token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        
        // Store current user info for other components
        localStorage.setItem('current_user', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          business_id: response.user.business_id
        }));
        
        // Create user object from response - backend returns nested user object
        const user = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim() || response.user.email.split('@')[0],
          role: 'admin',
          business_id: response.user.business_id,
          business_name: response.user.business_name,
          business_industry: response.user.business_industry
        };
        
        console.log('Constructed user object:', user); // Debug log
        
        onSuccess(user);
      } else {
        // Signup mode
        response = await apiClient.register({
          email: credentials.email,
          password: credentials.password,
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          business_name: credentials.businessName,
          business_website: credentials.businessWebsite,
          industry: credentials.industry
        });
        
        console.log('Signup response:', response); // Debug log
        
        // Store the token
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('auth_token_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
        
        // Store current user info for other components
        localStorage.setItem('current_user', JSON.stringify({
          id: response.user.id,
          email: response.user.email,
          business_id: response.user.business_id
        }));
        
        // Create user object from response
        const user = {
          id: response.user.id,
          email: response.user.email,
          name: `${response.user.first_name || ''} ${response.user.last_name || ''}`.trim() || response.user.email.split('@')[0],
          role: 'admin',
          business_id: response.user.business_id,
          business_name: response.user.business_name,
          business_industry: response.user.business_industry
        };
        
        console.log('Constructed user object from signup:', user); // Debug log
        
        onSuccess(user);
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      const errorMessage = error.message || `${mode === 'login' ? 'Login' : 'Signup'} failed. Please check your information.`;
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setCredentials({
      email: '',
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
            {mode === 'login' ? 'Sign in to your account' : 'Create your business account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('login')}
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
              onClick={() => setMode('signup')}
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

          <div className="space-y-4">
            {/* Name Fields (Signup only) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required={mode === 'signup'}
                      value={credentials.firstName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, firstName: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={credentials.lastName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, lastName: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <div className="mt-1 relative">
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
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
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
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
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

            {/* Business Fields (Signup only) */}
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required={mode === 'signup'}
                      value={credentials.businessName}
                      onChange={(e) => setCredentials(prev => ({ ...prev, businessName: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your business name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
                    Business Website
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="businessWebsite"
                      name="businessWebsite"
                      type="url"
                      value={credentials.businessWebsite}
                      onChange={(e) => setCredentials(prev => ({ ...prev, businessWebsite: e.target.value }))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={credentials.industry}
                    onChange={(e) => setCredentials(prev => ({ ...prev, industry: e.target.value }))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select an industry</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing</option>
                    <option value="technology">Technology</option>
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
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </div>

          {/* Mode Switch Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {mode === 'login' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 