// src/components/widgets.js
import React from 'react';
import { Widget, ProgressBar } from './common.js';
import { StarIcon, SunIcon, WeekIcon, MoonIcon, FireIcon, NoteIcon, LinkIcon, TextIcon } from './icons.js';
import { getToday } from '../utils/dateHelpers.js';

// Enums (re-declared or imported if from a shared types file)
const TaskPeriod = {
    Day: 'day',
    Week: 'week',
    Month: 'month',
};

export const TaskWidget = ({ period, tasks, onAreaClick, onTaskClick }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const progress = total > 0 ? (completed / total) * 100 : 0;
    
    const icons = {
        [TaskPeriod.Day]: <SunIcon className="w-5 h-5 text-accent-day" />,
        [TaskPeriod.Week]: <WeekIcon className="w-5 h-5 text-accent-week" />,
        [TaskPeriod.Month]: <MoonIcon className="w-5 h-5 text-accent-month" />,
    };
    
    return (
        <Widget className="flex-1 min-w-[280px] flex flex-col" onClick={onAreaClick}>
            <div className="flex items-center gap-2 mb-2">
                {icons[period]}
                <h2 className="text-lg font-bold text-text-primary">{period.charAt(0).toUpperCase() + period.slice(1)} Tasks</h2>
            </div>
            <div className="text-sm space-y-1 h-24 overflow-y-auto pr-2 flex-grow">
                {tasks.length > 0 ? tasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onTaskClick(task);
                        }} 
                        className={`flex items-center gap-2 p-1 rounded transition-colors ${
                            task.completed 
                            ? 'line-through text-text-secondary cursor-default' 
                            : 'hover:bg-widget-hover cursor-pointer text-text-primary'
                        }`}
                    >
                        <span>{task.text}</span>
                    </div>
                )) : <p className="text-text-secondary h-full flex items-center justify-center cursor-pointer">Click to add a task</p>}
            </div>
            <ProgressBar percentage={progress} />
        </Widget>
    );
};

export const CalendarWidget = ({ currentDate, onHeaderClick }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = currentDate.getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="w-8 h-8"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(
            <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full ${day === today ? 'bg-text-primary text-background font-bold' : ''}`}>
                {day}
            </div>
        );
    }

    return (
        <Widget className="w-[320px]">
            <h2 onClick={onHeaderClick} className="text-lg font-bold mb-2 text-text-primary flex items-center gap-2 cursor-pointer hover:text-text-primary transition-colors"><WeekIcon />Calendar</h2>
            <div className="text-center mb-2 font-mono text-text-secondary">{monthName} {year}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-text-secondary">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                {days}
            </div>
        </Widget>
    );
};

export const NotesWidget = ({ notes, onAddClick, onNoteClick }) => (
    <Widget className="flex-1">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2"><NoteIcon/>Notes</h2>
            <button onClick={onAddClick} className="text-text-secondary hover:text-text-primary transition-colors">
                <PlusIcon className="w-6 h-6"/>
            </button>
        </div>
        <div className="space-y-2 h-[220px] overflow-y-auto pr-2">
            {notes.length > 0 ? notes.map(note => (
                <div key={note.id} onClick={() => onNoteClick(note)} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-widget-hover transition-colors cursor-pointer">
                    {note.type === 'link' ? <LinkIcon className="w-4 h-4 mt-1 text-accent-link flex-shrink-0" /> : <TextIcon className="w-4 h-4 mt-1 text-text-secondary flex-shrink-0" />}
                    {note.type === 'link' ? 
                        <a href={note.content} target="_blank" rel="noopener noreferrer" className="text-accent-link hover:underline break-all" onClick={e => e.stopPropagation()}>{note.content}</a> : 
                        <span className="break-words whitespace-pre-wrap text-text-primary">{note.content}</span>
                    }
                </div>
            )) : <p className="text-text-secondary h-full flex items-center justify-center">Click the '+' to add a note</p>}
        </div>
    </Widget>
);

export const StreakWidget = ({ streak }) => (
    <Widget className="w-[200px]">
        <div className="flex items-center gap-2 mb-2 text-accent-streak">
            <FireIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold">Streak: {streak.current}</h2>
        </div>
        <div className="flex gap-1 my-3">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full flex-1 ${i < streak.starsThisWeek ? 'bg-accent-streak' : 'bg-progress-bg'}`}></div>
            ))}
        </div>
        <p className="text-sm text-center font-mono text-text-secondary">{streak.starsThisWeek}/7 this week</p>
    </Widget>
);

export const CountdownWidget = ({ targets }) => {
    const calculateProgress = (target) => {
        const now = new Date().getTime();
        const start = new Date(target.startDate).getTime();
        const end = new Date(target.date).getTime();
        
        if (now >= end) return { daysLeft: 0, progress: 100 };
        if (now < start) return { daysLeft: Math.ceil((end - now) / (1000 * 60 * 60 * 24)), progress: 0 };
        
        const totalDuration = end - start;
        const elapsed = now - start;
        const progress = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        
        return { daysLeft, progress };
    };
    
    const activeTargets = targets.map(t => ({...t, ...calculateProgress(t)})).filter(t => t.daysLeft > 0 || t.progress < 100);

    return (
        <Widget className="flex-1">
            <h2 className="text-lg font-bold mb-2 text-text-primary">Countdowns</h2>
            <div className="flex flex-col gap-3 h-[92px] overflow-y-auto pr-2">
            {activeTargets.length > 0 ? activeTargets.map(target => {
                return (
                    <div key={target.id}>
                        <div className="flex justify-between text-sm font-mono text-text-primary">
                            <span className="truncate pr-2">{target.label}</span>
                            <span>{target.daysLeft}d left</span>
                        </div>
                        <ProgressBar percentage={target.progress} />
                    </div>
                );
            }) : <p className="text-text-secondary h-full flex items-center justify-center text-center text-xs">Click on the Calendar header to add a countdown.</p>}
            </div>
        </Widget>
    );
};
