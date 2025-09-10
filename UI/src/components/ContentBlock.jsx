import React from 'react';

const ContentBlock = ({
                          imageSrc,
                          title,
                          description,
                          className = "",
                          onSelect,
                          role
                      }) => {
    return (
        <div
            className={`bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow ${className}`}
            onClick={onSelect}
        >
            {/* Image Section */}
            <div className="relative pb-[75%] w-full">
                <img
                    src={imageSrc || '/src/assets/default.jpg'}
                    alt={title || 'Food item'}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/src/assets/default.jpg';
                    }}
                />
            </div>

            {/* Content Section */}
            <div className="p-3">
                <h2 className="text-sm font-bold mb-1 truncate">{title}</h2>
                <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
            </div>
        </div>
    );
};

export default ContentBlock;