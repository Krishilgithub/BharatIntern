import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

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
		// Check for stored user data
		const storedUser = localStorage.getItem("user");
		if (storedUser) {
			setUser(JSON.parse(storedUser));
		}
		setLoading(false);
	}, []);

	const login = async (email, password, role) => {
		try {
			const response = await apiService.login({ email, password, role });

			// Check if response has the expected structure
			if (response.data && response.data.success && response.data.user) {
				const userData = response.data.user;
				setUser(userData);
				localStorage.setItem("user", JSON.stringify(userData));
				return { success: true };
			} else {
				throw new Error("Invalid response structure");
			}
		} catch (error) {
			console.error("Login error:", error);
			throw error; // Re-throw to let Login component handle it
		}
	};

	const signup = async (userData) => {
		try {
			const response = await apiService.signup(userData);

			// Check if response has the expected structure
			if (response.data && response.data.success && response.data.user) {
				const newUser = response.data.user;
				setUser(newUser);
				localStorage.setItem("user", JSON.stringify(newUser));
				return { success: true };
			} else {
				throw new Error("Invalid response structure");
			}
		} catch (error) {
			console.error("Signup error:", error);
			throw error; // Re-throw to let Signup component handle it
		}
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
	};

	const value = {
		user,
		login,
		signup,
		logout,
		loading,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
