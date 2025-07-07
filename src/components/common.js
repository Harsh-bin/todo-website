// src/components/common.js
import React from 'react';

export const Widget = ({ children, className = '', onClick }) => {
    return (
        <div 
            className={`bg-transparent border border-widget-border rounded-lg p-4 transition-all duration-300 ease-out 
                        hover:scale-[1.02] hover:border-widget-hover hover:shadow-[0_0_20px_rgba(0,0,0,0.1),0_0_40px_rgba(0,0,0,0.05)] 
                        ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const ProgressBar = ({ percentage }) => {
    const p = Math.max(0, Math.min(100, percentage));
    return (
        <div className="w-full bg-progress-bg rounded-full h-4 my-1 relative overflow-hidden text-xs font-mono">
            <div
                className="bg-progress-fill h-full rounded-full transition-all duration-500 ease-out flex items-center justify-center"
                style={{ width: `${p}%` }}
            >
                <span className="text-background mix-blend-screen px-2 font-bold">{p.toFixed(2)}%</span>
            </div>
            {p < 50 && <span className="absolute inset-0 flex items-center justify-center text-text-primary">{p.toFixed(2)}%</span>}
        </div>
    );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-modal-overlay flex justify-center items-center z-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-modal-bg text-text-primary rounded-lg shadow-xl border border-modal-border w-full max-w-md p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-text-primary font-bold">{title}</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl leading-none">&times;</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
};
