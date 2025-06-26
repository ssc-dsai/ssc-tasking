import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

const Login: React.FC = () => {
  const { signIn, signUp, user, loading } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Sign In Form State
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  })
  
  // Sign Up Form State
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(signInForm.email, signInForm.password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(signUpForm.email, signUpForm.password, {
        full_name: signUpForm.fullName
      })
      if (error) {
        setError(error.message)
      } else {
        setError('')
        // Show success message or redirect
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">{t('auth.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/5abdbc0c-d333-4138-b3bc-e3f5c888dc65.png" 
            alt="SSC Tasking" 
            className="w-12 h-12 mx-auto mb-4 rounded-lg"
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">{t('dashboard.subtitle')}</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm dark:bg-slate-800">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">{t('auth.welcome')}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('auth.welcomeDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700">
                <TabsTrigger value="signin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">{t('auth.signin')}</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 dark:text-slate-300 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white">{t('auth.signup')}</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Sign In Tab */}
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                        placeholder={t('auth.enterEmail')}
                        className="pl-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signInForm.password}
                        onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                        placeholder={t('auth.enterPassword')}
                        className="pl-10 pr-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t('auth.signin')
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.fullName')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signup-name"
                        type="text"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm({ ...signUpForm, fullName: e.target.value })}
                        placeholder={t('auth.fullNamePlaceholder')}
                        className="pl-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.email')}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                        placeholder={t('auth.enterEmail')}
                        className="pl-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.password')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                        placeholder={t('auth.createPassword')}
                        className="pl-10 pr-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('auth.confirmPassword')}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        className="pl-10 border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t('auth.createAccount')
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          {t('auth.termsText')}
        </p>
      </div>
    </div>
  )
}

export default Login 