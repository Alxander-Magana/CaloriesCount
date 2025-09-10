import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, Search } from 'lucide-react';

const FAQPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedQuestions, setExpandedQuestions] = useState([]);

    // FAQ categories and questions
    const faqCategories = [
        {
            category: "General Questions",
            questions: [
                {
                    id: "general-1",
                    question: "What is Calories Count?",
                    answer: "Calories Count is a comprehensive food and nutrition tracking application designed to help you monitor your daily calorie intake, track nutritional information, and make healthier food choices."
                },
                {
                    id: "general-2",
                    question: "Do I need to create an account to use Calories Count?",
                    answer: "While you can browse foods and view nutritional information without an account, creating a free account allows you to save your favorite foods, create meal plans, track your daily calorie intake with historical records, and access personalized recommendations."
                }

            ]
        },
        {
            category: "Food Database & Nutrition",
            questions: [
                {
                    id: "food-1",
                    question: "How accurate is the nutritional information?",
                    answer: "Our nutritional information comes from verified databases and is regularly updated. However, please note that actual nutritional content may vary slightly depending on brand, preparation method, and portion size."
                },
                {
                    id: "food-2",
                    question: "Can I add my own recipes or foods to the database?",
                    answer: "Yes! Registered users can add custom foods and recipes. Once added, these items will appear in your personal food library and can be added to your meal plans."
                },
                {
                    id: "food-3",
                    question: "How do I filter foods by dietary preferences?",
                    answer: "You can use the diet filter icons in the navigation bar to show only foods that match specific dietary preferences such as vegetarian, vegan, carnivore, or pescatarian." +
                        "Additionally, tags are placed on food items to indicate their dietary preferences. For example, the 'Fruit' tag can be used to search explicitly for fruit-based foods."
                },
                {
                    id: "food-4",
                    question: "What does the nutrition label show?",
                    answer: "Our nutrition labels display calories and macronutrients (protein, carbs, fat). Click on any food item to view its complete nutritional profile."
                }
            ]
        },
        {
            category: "Meal Planning & Tracking",
            questions: [
                {
                    id: "meal-1",
                    question: "How do I create a meal plan?",
                    answer: "Navigate to the Calorie Planner section, select a date, and start adding foods to your breakfast, lunch, or dinner. The system will automatically calculate total calories and nutrition for each meal and for the entire day."
                },
                {
                    id: "meal-2",
                    question: "Can I set calorie and nutrient goals?",
                    answer: "Yes! In your profile settings, you can set daily goals for calories, protein, carbs, fat, and other nutrients. The system will track your progress toward these goals as you add foods to your daily log."
                },
                {
                    id: "meal-3",
                    question: "How do I add a food to my favorites?",
                    answer: "When viewing any food item, click the heart icon to add it to your favorites. You can access your favorite foods quickly from your profile or when adding items to your meal plan."
                }
            ]
        },
        {
            category: "Account & Privacy",
            questions: [
                {
                    id: "account-1",
                    question: "How do I update my profile information?",
                    answer: "Click on your profile icon in the top right corner, select 'Profile' from the dropdown menu, and you'll be able to edit your personal information, preferences, and goals."
                },
                {
                    id: "account-2",
                    question: "Is my personal data secure?",
                    answer: "Yes, we take data security very seriously. All personal information is encrypted, and we never share your data with third parties. For more information, please review our Privacy Policy."
                },
                {
                    id: "account-3",
                    question: "How do I delete my account?",
                    answer: "To delete your account, go to your Profile settings, scroll to the bottom, and click 'Delete Account'. Please note that this action is irreversible and will permanently remove all your data from our system."
                }
            ]
        },
        {
            category: "Technical Support",
            questions: [
                {
                    id: "tech-1",
                    question: "The website isn't loading properly. What should I do?",
                    answer: "Try clearing your browser cache and cookies, or try accessing the site using a different browser. "
                },
                {
                    id: "tech-2",
                    question: "I found an error in a food's nutritional information. How do I report it?",
                    answer: "Please navigate to the help page for a direct link to our feedback email, or simply reach out to this email and your feedback will be used in future updates: fakesupport@caloriescount.com"
                },
                {
                    id: "tech-3",
                    question: "How do I submit feature requests or suggestions?",
                    answer: "We love hearing from our users! Please send your ideas and suggestions to fakesupport@caloriescount.com or use the Feedback form in the Help section."
                }
            ]
        }
    ];

    const toggleQuestion = (id) => {
        if (expandedQuestions.includes(id)) {
            setExpandedQuestions(expandedQuestions.filter(q => q !== id));
        } else {
            setExpandedQuestions([...expandedQuestions, id]);
        }
    };

    // Filter questions based on search query
    const filteredFAQs = searchQuery.trim() === ''
        ? faqCategories
        : faqCategories.map(category => ({
            category: category.category,
            questions: category.questions.filter(q =>
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(category => category.questions.length > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
                                <ArrowLeft size={20} className="mr-2" />
                                <span>Back to Home</span>
                            </Link>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Frequently Asked Questions</h1>
                        <div className="w-24"></div> {/* Empty div for flex spacing */}
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="bg-blue-600 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-xl mx-auto">
                        <h2 className="text-xl font-semibold text-white mb-4 text-center">
                            How can we help you today?
                        </h2>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search for answers..."
                                className="w-full px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 py-12">
                {filteredFAQs.length === 0 ? (
                    <div className="text-center py-10">
                        <h3 className="text-xl font-medium text-gray-700">No results found</h3>
                        <p className="text-gray-500 mt-2">Try using different keywords or browse our categories below.</p>
                    </div>
                ) : (
                    filteredFAQs.map((category, categoryIndex) => (
                        category.questions.length > 0 && (
                            <div key={categoryIndex} className="mb-10">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                                    {category.category}
                                </h2>
                                <div className="space-y-4">
                                    {category.questions.map((item) => (
                                        <div
                                            key={item.id}
                                            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(item.id)}
                                                className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-inset"
                                            >
                                                <span className="font-medium text-gray-800">{item.question}</span>
                                                {expandedQuestions.includes(item.id) ? (
                                                    <ChevronUp className="text-blue-600" size={20} />
                                                ) : (
                                                    <ChevronDown className="text-blue-600" size={20} />
                                                )}
                                            </button>
                                            {expandedQuestions.includes(item.id) && (
                                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                                    <p className="text-gray-600">{item.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))
                )}

                {/* Contact Section */}
                <div className="mt-12 bg-white rounded-lg shadow-sm p-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Still have questions?</h2>
                    <p className="text-gray-600 mb-6">
                        If you couldn't find the answer to your question, feel free to contact our support team.
                        We're here to help!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a
                            href="mailto:fakesupport@caloriescount.com"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                        >
                            Contact Support
                        </a>
                        <a
                            href="mailto:fakecustomerservice@caloriescount.com"
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                        >
                            Submit Feedback
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} Calories Count. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default FAQPage;