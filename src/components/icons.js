// src/components/icons.js
import React from 'react';

export const StarIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21z" clipRule="evenodd" />
    </svg>
);

export const SunIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-5 h-5'}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.59 1.59a.75.75 0 010 1.06zM12 21a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75-.75zM7.106 18.894a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM6.106 7.106a.75.75 0 011.06 0l1.591 1.59a.75.75 0 01-1.06 1.06l-1.59-1.591a.75.75 0 010-1.06z" />
    </svg>
);

export const WeekIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-5 h-5'}>
        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM5.25 6.75c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h13.5c.621 0 1.125-.504 1.125-1.125V7.875c0-.621-.504-1.125-1.125-1.125H5.25z" clipRule="evenodd" />
    </svg>
);

export const MoonIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-5 h-5'}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.635 4.398-8.552a.75.75 0 01.819.162z" clipRule="evenodd" />
    </svg>
);

export const FireIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-5 h-5'}>
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.072 7.5 7.5 0 00-2.28 5.684C9.612 12.005 9.75 14.25 12 15.75c2.25-1.5 2.388-3.745 2.388-6.708 0-2.16-1.035-4.14-2.425-5.756zM12 3.375c-1.428 1.667-2.388 3.744-2.388 6.002 0 2.457.734 4.14 2.388 5.25 1.654-1.11 2.388-2.793 2.388-5.25 0-2.258-.96-4.335-2.388-6.002z" clipRule="evenodd" />
    </svg>
);

export const NoteIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-5 h-5'}>
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3H5.625zM12.75 3.75V8.25h4.5V12h-4.5a.75.75 0 01-.75-.75V3.75h.75z" clipRule="evenodd" />
    </svg>
);

export const LinkIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-4 h-4'}>
        <path d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3 3 0 104.243 4.243l4.5-4.5a3 3 0 00-4.243-4.243l-1.954 1.954a.75.75 0 11-1.06-1.06l1.954-1.954a4.5 4.5 0 016.364 0z" />
        <path d="M10.81 15.312a4.5 4.5 0 01-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3 3 0 10-4.243-4.243l-4.5 4.5a3 3 0 004.243 4.243l1.954-1.954a.75.75 0 111.06 1.06l-1.954 1.954a4.5 4.5 0 01-6.364 0z" />
    </svg>
);

export const TextIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-4 h-4'}>
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3H5.625zM12.75 3.75V8.25h4.5V12h-4.5a.75.75 0 01-.75-.75V3.75h.75z" clipRule="evenodd" />
    </svg>
);

export const PlusIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
    </svg>
);

export const DataIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || 'w-6 h-6'}>
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85a1.5 1.5 0 01-1.83 1.255l-3.086-.73a1.875 1.875 0 00-2.28 1.217l-1.944 3.366a1.875 1.875 0 00.82 2.45l2.553 1.474a1.5 1.5 0 010 2.592l-2.553 1.474a1.875 1.875 0 00-.82 2.45l1.944 3.366a1.875 1.875 0 002.28 1.217l3.086-.73a1.5 1.5 0 011.83 1.255l.178 2.034c.15.904.933 1.567 1.85 1.567h1.844c.917 0 1.699-.663 1.85-1.567l.178-2.034a1.5 1.5 0 011.83-1.255l3.086.73a1.875 1.875 0 002.28-1.217l1.944-3.366a1.875 1.875 0 00-.82-2.45l-2.553-1.474a1.5 1.5 0 010-2.592l2.553-1.474a1.875 1.875 0 00.82-2.45l-1.944-3.366a1.875 1.875 0 00-2.28-1.217l-3.086.73a1.5 1.5 0 01-1.83-1.255l-.178-2.034A1.875 1.875 0 0012.922 2.25h-1.844zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

export const ExportIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const ImportIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const ResetIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-3.181-4.991v4.99" />
    </svg>
);

export const LightbulbIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 1.5a6 6 0 01-6-6V6.75m6 1.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V6a3 3 0 013-3 3 3 0 013 3v6.75a3 3 0 01-3 3z" />
    </svg>
);

export const MoonStarsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || 'w-6 h-6'}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.567 0-10.11-4.186-10.703-9.526A9.754 9.754 0 0012 2.25c5.567 0 10.11 4.186 10.703 9.526z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9.75H12a2.25 2.25 0 00-2.25 2.25v3.75m-9.75 0h1.5a2.25 2.25 0 002.25-2.25v-3.75m-9.75 0h1.5a2.25 2.25 0 002.25-2.25V6.75" />
    </svg>
);
