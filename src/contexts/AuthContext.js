import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session
		const getInitialSession = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();

				if (session?.user) {
					// Get user data from metadata
					const userData = {
						...session.user,
						role: session.user.user_metadata?.role || 'candidate',
						name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
						phone: session.user.user_metadata?.phone || '',
						location: session.user.user_metadata?.location || '',
						company_name: session.user.user_metadata?.company_name || ''
					};
					setUser(userData);
				}
			} catch (error) {
				console.error('Error getting initial session:', error);
			} finally {
				setLoading(false);
			}
		};

		getInitialSession();

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === 'SIGNED_IN' && session?.user) {
				// Get user data from metadata
				const userData = {
					...session.user,
					role: session.user.user_metadata?.role || 'candidate',
					name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
					phone: session.user.user_metadata?.phone || '',
					location: session.user.user_metadata?.location || '',
					company_name: session.user.user_metadata?.company_name || ''
				};
				setUser(userData);
			} else if (event === 'SIGNED_OUT') {
				setUser(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const signInWithGoogle = async (role) => {
		try {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
					redirectTo: window.location.origin,
				},
			});

			if (error) throw error;

			// The role will be set after the OAuth callback
			if (data) {
				// Update user metadata with role
				await supabase.auth.updateUser({
					data: { role: role }
				});
			}
		} catch (error) {
			console.error('Google Sign In error:', error);
			throw new Error(error.message || 'Failed to sign in with Google');
		}
	};

	const login = async (email, password, role) => {
		try {
			console.log('Attempting login for:', email, 'with role:', role);

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error('Supabase auth error:', error);
				// Provide more specific error messages
				if (error.message.includes('Invalid login credentials')) {
					throw new Error('Invalid email or password. Please check your credentials and try again.');
				} else if (error.message.includes('Email not confirmed')) {
					throw new Error('Please check your email and click the verification link before logging in.');
				} else {
					throw new Error(error.message || 'Login failed. Please try again.');
				}
			}

			if (data.user) {
				console.log('User authenticated:', data.user.id);

				// Check if email is confirmed
				if (!data.user.email_confirmed_at) {
					await supabase.auth.signOut();
					throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
				}

				// Get user role from metadata
				const userRole = data.user.user_metadata?.role || 'candidate';
				console.log('User role from metadata:', userRole);

				// Check if the user's role matches the requested role
				if (role && userRole !== role) {
					await supabase.auth.signOut();
					throw new Error(`Access denied. This account is registered as a ${userRole}, not a ${role}. Please select the correct role or contact support.`);
				}

				// Set user data from metadata
				const userData = {
					...data.user,
					role: userRole,
					name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
					phone: data.user.user_metadata?.phone || '',
					location: data.user.user_metadata?.location || '',
					company_name: data.user.user_metadata?.company_name || ''
				};

				setUser(userData);
			}

			return { success: true };
		} catch (error) {
			console.error("Login error:", error);
			// Re-throw the error with a user-friendly message
			throw error;
		}
	};

	const signup = async (userData) => {
		try {
			console.log('Attempting signup for:', userData.email, 'with role:', userData.role);

			const { data, error } = await supabase.auth.signUp({
				email: userData.email,
				password: userData.password,
				options: {
					data: {
						name: userData.name,
						role: userData.role || 'candidate',
						phone: userData.phone,
						location: userData.location,
						...(userData.role === 'company' && {
							company_name: userData.companyName
						})
					}
				}
			});

			if (error) {
				console.error('Supabase signup error:', error);
				// Provide more specific error messages
				if (error.message.includes('already registered')) {
					throw new Error('An account with this email already exists. Please try logging in instead.');
				} else if (error.message.includes('Password should be at least')) {
					throw new Error('Password must be at least 6 characters long.');
				} else if (error.message.includes('Invalid email')) {
					throw new Error('Please enter a valid email address.');
				} else {
					throw new Error(error.message || 'Signup failed. Please try again.');
				}
			}

			if (data.user) {
				console.log('User created:', data.user.id);

				// Set user data from metadata (already stored in signup)
				const userDataFromMeta = {
					...data.user,
					role: userData.role || 'candidate',
					name: userData.name,
					phone: userData.phone || '',
					location: userData.location || '',
					company_name: userData.companyName || ''
				};

				setUser(userDataFromMeta);
			}

			return {
				success: true,
				message: data.user ?
					'Account created successfully! Please check your email and click the verification link to complete your registration.' :
					'Please check your email and click the verification link to complete your registration.'
			};
		} catch (error) {
			console.error("Signup error:", error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			await supabase.auth.signOut();
			setUser(null);
		} catch (error) {
			console.error("Logout error:", error);
			// Still clear user state even if logout fails
			setUser(null);
		}
	};

	const resetPassword = async (email) => {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});

			if (error) {
				throw error;
			}

			return { success: true };
		} catch (error) {
			console.error("Reset password error:", error);
			throw error;
		}
	};

	const value = {
		user,
		login,
		signup,
		logout,
		resetPassword,
		signInWithGoogle,
		loading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
