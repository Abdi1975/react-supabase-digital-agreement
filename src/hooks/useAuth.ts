import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, handleAuthError, AuthError } from '../services/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

interface SignUpData {
  email: string
  password: string
  fullName?: string
}

interface SignInData {
  email: string
  password: string
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            error: error ? handleAuthError(error) : null,
          })
        }
      } catch (error) {
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: handleAuthError(error),
          }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            error: null,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (data: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName || '',
          },
        },
      })

      if (error) {
        const authError = handleAuthError(error)
        setAuthState(prev => ({ ...prev, loading: false, error: authError }))
        return { success: false, error: authError }
      }

      setAuthState(prev => ({
        ...prev,
        user: authData.user || null,
        session: authData.session || null,
        loading: false,
      }))

      return { success: true, user: authData.user, session: authData.session }
    } catch (error) {
      const authError = handleAuthError(error)
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { success: false, error: authError }
    }
  }, [])

  const signIn = useCallback(async (data: SignInData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        const authError = handleAuthError(error)
        setAuthState(prev => ({ ...prev, loading: false, error: authError }))
        return { success: false, error: authError }
      }

      setAuthState(prev => ({
        ...prev,
        user: authData.user || null,
        session: authData.session || null,
        loading: false,
      }))

      return { success: true, user: authData.user, session: authData.session }
    } catch (error) {
      const authError = handleAuthError(error)
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { success: false, error: authError }
    }
  }, [])

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        const authError = handleAuthError(error)
        setAuthState(prev => ({ ...prev, loading: false, error: authError }))
        return { success: false, error: authError }
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })

      return { success: true }
    } catch (error) {
      const authError = handleAuthError(error)
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { success: false, error: authError }
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)

      if (error) {
        const authError = handleAuthError(error)
        setAuthState(prev => ({ ...prev, loading: false, error: authError }))
        return { success: false, error: authError }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      const authError = handleAuthError(error)
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { success: false, error: authError }
    }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        const authError = handleAuthError(error)
        setAuthState(prev => ({ ...prev, loading: false, error: authError }))
        return { success: false, error: authError }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true }
    } catch (error) {
      const authError = handleAuthError(error)
      setAuthState(prev => ({ ...prev, loading: false, error: authError }))
      return { success: false, error: authError }
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    isAuthenticated: !!authState.user,
  }
}

export type { AuthState, SignUpData, SignInData }