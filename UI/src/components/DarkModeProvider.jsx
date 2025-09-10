import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        const newDarkMode = !isDarkMode;
        setIsDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode.toString());
    };

    return (
        <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};

export const useDarkMode = () => useContext(DarkModeContext);

export default DarkModeProvider;

