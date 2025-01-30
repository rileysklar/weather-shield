import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isSignedIn: boolean;
    setSignedIn: (value: boolean) => void;
    hasSeenOnboarding: boolean;
    setHasSeenOnboarding: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isSignedIn, setSignedIn] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    return (
        <AuthContext.Provider value={{ isSignedIn, setSignedIn, hasSeenOnboarding, setHasSeenOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 