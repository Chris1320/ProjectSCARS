"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { LocalStorage } from "@/lib/info";
import { TokenType } from "@/lib/types";

interface AuthContextType {
    isAuthenticated: boolean; // Whether the user is authenticated
    login: (
        access_token: TokenType,
    ) => void; // Function to log the user in
    logout: () => void; // Function to log the user out
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window === "undefined") {
            console.debug("Window is undefined");
            return false; // Server-side rendering
        }

        console.debug("Window is defined");
        const stored_auth_state = localStorage.getItem(LocalStorage.access_token);
        return stored_auth_state !== null;
    });

    /// Log the user in
    const login = (
        access_token: TokenType,
    ) => {
        console.debug("Setting local login state to true");
        localStorage.setItem(
            LocalStorage.access_token,
            JSON.stringify(access_token),
        );
        setIsAuthenticated(true);
    };

    /// Log the user out
    const logout = () => {
        console.debug("Setting local login state to false");
        setIsAuthenticated(false);
        localStorage.removeItem(LocalStorage.access_token);
        localStorage.removeItem(LocalStorage.user_data);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook to access the authentication context.
 * This hook is used to access the authentication context in a component
 */
export function useAuth(): AuthContextType {
    console.debug("useAuth called");
    const ctx = useContext(AuthContext);
    if (!ctx) {
        const errorMessage = "useAuth must be used within an AuthProvider";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return ctx;
}
