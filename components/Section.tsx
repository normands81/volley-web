import React from 'react';

interface SectionProps {
    id: string;
    title: string;
    bgColor?: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ id, title, bgColor = 'bg-white', children }) => {
    return (
        <section id={id} className={`py-20 ${bgColor}`}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-blue-900 uppercase tracking-tight inline-block relative">
                        {title}
                        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-yellow-500 rounded-full"></span>
                    </h2>
                </div>
                {children}
            </div>
        </section>
    );
};

export default Section;
