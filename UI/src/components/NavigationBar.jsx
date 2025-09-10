import React, { useState } from 'react';
import SettingsModal from './SettingsModal';

import {
    Search, Leaf, Beef, Milk, Shrimp, User, Menu,
    Plus, LogOut, Heart, UserCircle, LogIn, ClipboardEdit, Settings, Trash2
} from 'lucide-react';
import logo from '/src/assets/logo.png';
import FavoriteModal from './FavoriteModal';

const NavigationBar = ({
                           searchQuery,
                           setSearchQuery,
                           searchInputRef,
                           isMoreDropdownOpen,
                           setIsMoreDropdownOpen,
                           moreButtonRef,
                           isProfileDropdownOpen,
                           handleProfileClick,
                           profileDropdownRef,
                           isLoggedIn,
                           currentUsername,
                           handleProfileNavigation,
                           handleCaloriePlanNavigation,
                           handleLogout,
                           setShowLoginPage,
                           onAddFoodClick,
                           handleDietFilter,
                           selectedDiet,
                           userRole,
                           simplifiedNavbar = false,
                           setIsProfileDropdownOpen,
                           handleDeleteAccount
                       }) => {
    const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const diets = [
        { icon: Leaf, text: 'Vegan' },
        { icon: Beef, text: 'Carnivore' },
        { icon: Milk, text: 'Vegetarian' },
        { icon: Shrimp, text: 'Pescatarian' }
    ];

    const categories = [
        'Meat', 'Seafood', 'Vegetable', 'Grain', 'Sweets',
        'Fruit', 'Nut', 'Seasoning', 'Drinks', 'Other'
    ];

    return (
        <nav className="bg-white shadow-md w-full fixed top-0 left-0 z-40">
            <div className="container mx-auto px-5 py-4 flex items-center">
                <div className="flex-shrink-0">
                    <a
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/';
                        }}
                        className="block cursor-pointer"
                    >
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-12 w-auto"
                        />
                    </a>
                </div>
                {!simplifiedNavbar && (
                    <>
                        <div className="flex-grow mx-4 max-w-md">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-4 pr-10 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={25}
                                />
                            </div>
                        </div>
                        <div className="mx-auto flex items-center space-x-10">
                            {diets.map(({ icon, text }) => {
                                const IconComponent = icon;
                                const isSelected = selectedDiet === text.toLowerCase();
                                return (
                                    <div
                                        key={text}
                                        className="group relative cursor-pointer"
                                        onClick={() => handleDietFilter(text.toLowerCase())}
                                    >
                                        <IconComponent
                                            className={`${isSelected ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-600 transition-colors`}
                                            size={35}
                                        />
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            {text}
                                        </span>
                                    </div>
                                );
                            })}
                            <div
                                ref={moreButtonRef}
                                className="group relative cursor-pointer"
                                onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                            >
                                <Menu
                                    className="text-gray-600 hover:text-blue-600 transition-colors"
                                    size={35}
                                />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    More
                                </span>
                            </div>
                        </div>
                    </>
                )}
                <div className="ml-auto flex-shrink-0">
                    <div
                        ref={profileDropdownRef}
                        className="group relative cursor-pointer z-[10000]"
                        onClick={handleProfileClick}
                    >
                        <div className="flex items-center space-x-2">
                            <User
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                size={35}
                            />
                            {simplifiedNavbar && (
                                <span className="text-gray-700 font-medium">{currentUsername}</span>
                            )}
                        </div>

                        {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-xl z-[9999] border border-gray-200">
                                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                                    {isLoggedIn ? currentUsername : "Guest"}
                                </div>
                                {isLoggedIn && (
                                    <button
                                        onClick={() => {
                                            setIsSettingsModalOpen(true);
                                            setIsProfileDropdownOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        <Settings className="mr-2" size={16} />
                                        Settings
                                    </button>
                                )}

                                {simplifiedNavbar ? (
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="mr-2" size={16} />
                                        Logout
                                    </button>
                                ) : (
                                    isLoggedIn ? (
                                        <>
                                            <button
                                                onClick={handleProfileNavigation}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <UserCircle className="mr-2" size={16} />
                                                Profile
                                            </button>

                                            <button
                                                onClick={handleCaloriePlanNavigation}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <ClipboardEdit className="mr-2" size={16} />
                                                Calorie Planner
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setIsFavoriteModalOpen(true);
                                                    setIsProfileDropdownOpen(false);
                                                }}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <Heart className="mr-2" size={16} />
                                                Favorites
                                            </button>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <LogOut className="mr-2" size={16} />
                                                Logout
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="mr-2" size={16} />
                                                Delete Account
                                            </button>

                                            {userRole === 'ADMIN' && (
                                                <button
                                                    onClick={() => {
                                                        window.location.href = '/admin';
                                                        setIsProfileDropdownOpen(false);
                                                    }}
                                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Settings className="mr-2" size={16} />
                                                    Admin Panel
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setShowLoginPage(true);
                                                setIsMoreDropdownOpen(false);
                                            }}
                                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogIn className="mr-2" size={16} />
                                            Login / Register
                                        </button>
                                    )
                                )}
                                                            </div>
                        )}
                    </div>
                </div>
            </div>
            {!simplifiedNavbar && isMoreDropdownOpen && (
                <>
                    <div className="absolute top-full left-0 w-full bg-white shadow-md z-[1000]">
                        <div className="container mx-auto px-5 py-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Diets</h3>
                                    <div className="space-y-3">
                                        {diets.map(({ icon, text }) => {
                                            const IconComponent = icon;
                                            const isSelected = selectedDiet === text.toLowerCase();
                                            return (
                                                <div
                                                    key={text}
                                                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-4 rounded-md text-xl"
                                                    onClick={() => handleDietFilter(text.toLowerCase())}
                                                >
                                                    <IconComponent size={28} className="text-gray-600" />
                                                    <div className={`${isSelected ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} hover:bg-gray-100 p-2 rounded-md text-center text-xl transition-colors`}>
                                                        {text}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Categories</h3>
                                    <div className="grid grid-cols-2 gap-3 pt-6">
                                        {categories.map((category) => (
                                            <div
                                                key={category}
                                                className="group relative cursor-pointer"
                                                onClick={() => handleDietFilter(category.toLowerCase())}
                                            >
                                                <div className={`${selectedDiet === category.toLowerCase() ? 'bg-blue-100 text-blue-600' : 'text-gray-600'} hover:bg-gray-100 p-2 rounded-md text-center text-xl transition-colors`}>
                                                    {category}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Plus
                                size={40}
                                className="absolute bottom-4 right-8 text-blue-500 cursor-pointer hover:bg-blue-100 rounded-full p-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddFoodClick();
                                }}
                            />
                        </div>
                    </div>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30"
                        style={{ top: '82px' }}
                    />
                </>
            )}
            {!simplifiedNavbar && (
                <FavoriteModal
                    isOpen={isFavoriteModalOpen}
                    onClose={() => setIsFavoriteModalOpen(false)}
                    userId={isLoggedIn ? localStorage.getItem('userId') : null}
                />
            )}
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </nav>
    );
};

export default NavigationBar;