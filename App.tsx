import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskPeriod, Note, TargetDate, StarsData, StreakData } from './types';
import { StarIcon, SunIcon, WeekIcon, MoonIcon, FireIcon, NoteIcon, LinkIcon, TextIcon, PlusIcon, ExportIcon, ResetIcon } from './components/icons';
import Widget from './components/Widget';
import ProgressBar from './components/ProgressBar';
import Modal from './components/Modal';

// --- Utility Functions ---
const getToday = () => new Date().toISOString().split('T')[0];
const getWeekNumber = (d: Date) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
};
const getMonth = () => `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
const isMonday = () => new Date().getDay() === 1;
const isFirstOfMonth = () => new Date().getDate() === 1;

const LOCAL_STORAGE_KEYS = [
    'day_tasks', 'week_tasks', 'month_tasks', 'notes', 'target_dates', 'stars', 'streak'
];

// --- Custom Hook for Local Storage ---
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// --- Child Components ---

const TaskWidget = ({ period, tasks, onAreaClick, onTaskClick }: { period: TaskPeriod; tasks: Task[]; onAreaClick: () => void; onTaskClick: (task: Task) => void; }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  
  const icons = {
    [TaskPeriod.Day]: <SunIcon className="w-5 h-5 text-yellow-400" />,
    [TaskPeriod.Week]: <WeekIcon className="w-5 h-5 text-sky-400" />,
    [TaskPeriod.Month]: <MoonIcon className="w-5 h-5 text-indigo-400" />,
  };
  
  return (
    <Widget className="flex-1 min-w-[280px] flex flex-col" onClick={onAreaClick}>
      <div className="flex items-center gap-2 mb-2">
        {icons[period]}
        <h2 className="text-lg font-bold text-slate-200">{period.charAt(0).toUpperCase() + period.slice(1)} Tasks</h2>
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
                ? 'line-through text-slate-500 cursor-default' 
                : 'hover:bg-white/10 cursor-pointer text-slate-300'
            }`}
          >
            <span>{task.text}</span>
          </div>
        )) : <p className="text-slate-500 h-full flex items-center justify-center cursor-pointer">Click to add a task</p>}
      </div>
      <ProgressBar percentage={progress} />
    </Widget>
  );
};

const CalendarWidget = ({ currentDate, onHeaderClick }: { currentDate: Date; onHeaderClick: () => void; }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = currentDate.getDate();

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="w-8 h-8"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(
            <div key={day} className={`w-8 h-8 flex items-center justify-center rounded-full ${day === today ? 'bg-white text-black font-bold' : ''}`}>
                {day}
            </div>
        );
    }

    return (
        <Widget className="w-[320px]">
            <h2 onClick={onHeaderClick} className="text-lg font-bold mb-2 text-slate-200 flex items-center gap-2 cursor-pointer hover:text-white transition-colors"><WeekIcon />Calendar</h2>
            <div className="text-center mb-2 font-mono">{monthName} {year}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-slate-400">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                {days}
            </div>
        </Widget>
    );
};

const NotesWidget = ({ notes, onAddClick, onNoteClick }: { notes: Note[]; onAddClick: () => void; onNoteClick: (note: Note) => void; }) => (
    <Widget className="flex-1">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2"><NoteIcon/>Notes</h2>
            <button onClick={onAddClick} className="text-slate-400 hover:text-white transition-colors">
                <PlusIcon className="w-6 h-6"/>
            </button>
        </div>
        <div className="space-y-2 h-[220px] overflow-y-auto pr-2">
            {notes.length > 0 ? notes.map(note => (
                <div key={note.id} onClick={() => onNoteClick(note)} className="flex items-start gap-2 text-sm p-2 rounded hover:bg-white/10 transition-colors cursor-pointer">
                    {note.type === 'link' ? <LinkIcon className="w-4 h-4 mt-1 text-cyan-400 flex-shrink-0" /> : <TextIcon className="w-4 h-4 mt-1 text-slate-400 flex-shrink-0" />}
                    {note.type === 'link' ? 
                        <a href={note.content} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all" onClick={e => e.stopPropagation()}>{note.content}</a> : 
                        <span className="break-words whitespace-pre-wrap text-slate-300">{note.content}</span>
                    }
                </div>
            )) : <p className="text-slate-500 h-full flex items-center justify-center">Click the '+' to add a note</p>}
        </div>
    </Widget>
);

const StreakWidget = ({ streak }: { streak: StreakData; }) => (
    <Widget className="w-[200px]">
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
            <FireIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold">Streak: {streak.current}</h2>
        </div>
        <div className="flex gap-1 my-3">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full flex-1 ${i < streak.starsThisWeek ? 'bg-yellow-400' : 'bg-white/20'}`}></div>
            ))}
        </div>
        <p className="text-sm text-center font-mono text-slate-400">{streak.starsThisWeek}/7 this week</p>
    </Widget>
);

const CountdownWidget = ({ targets }: { targets: TargetDate[]; }) => {
    const calculateProgress = (target: TargetDate) => {
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
             <h2 className="text-lg font-bold mb-2 text-slate-200">Countdowns</h2>
            <div className="flex flex-col gap-3 h-[92px] overflow-y-auto pr-2">
            {activeTargets.length > 0 ? activeTargets.map(target => {
                return (
                    <div key={target.id}>
                        <div className="flex justify-between text-sm font-mono text-slate-300">
                            <span className="truncate pr-2">{target.label}</span>
                            <span>{target.daysLeft}d left</span>
                        </div>
                        <ProgressBar percentage={target.progress} />
                    </div>
                );
            }) : <p className="text-slate-500 h-full flex items-center justify-center text-center text-xs">Click on the Calendar header to add a countdown.</p>}
            </div>
        </Widget>
    );
};


// --- Main App Component ---
function App() {
  const [dayTasks, setDayTasks] = useLocalStorage<Task[]>(`day_tasks`, []);
  const [weekTasks, setWeekTasks] = useLocalStorage<Task[]>(`week_tasks`, []);
  const [monthTasks, setMonthTasks] = useLocalStorage<Task[]>(`month_tasks`, []);
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', []);
  const [targets, setTargets] = useLocalStorage<TargetDate[]>('target_dates', []);
  const [starsData, setStarsData] = useLocalStorage<StarsData>('stars', {
      stars: { daily: 0, weekly: 0, monthly: 0 },
      dailyResetDate: '', weeklyResetWeek: '', monthlyResetMonth: '',
      totalEarned: 0, totalTasks: 0
  });
  const [streak, setStreak] = useLocalStorage<StreakData>('streak', { current: 0, starsThisWeek: 0, lastUpdate: '' });

  const [modal, setModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  
  const currentDate = new Date();

  const handleResetsAndStreak = useCallback(() => {
    const todayStr = getToday();
    const currentWeek = getWeekNumber(currentDate);
    const currentMonth = getMonth();

    let newStarsData = { ...starsData };
    let newStreak = { ...streak };

    if (newStarsData.dailyResetDate !== todayStr) {
      if (streak.lastUpdate && streak.lastUpdate !== todayStr) {
          const allDayTasksCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);
          if (allDayTasksCompleted) {
              newStreak.current += 1;
              newStreak.starsThisWeek = Math.min(7, newStreak.starsThisWeek + 1);
          } else if(dayTasks.length > 0) {
              newStreak.current = 0;
          }
      }
      newStreak.lastUpdate = todayStr;
      newStarsData.stars.daily = 0;
      newStarsData.dailyResetDate = todayStr;
      setDayTasks([]);
    }
    
    if (newStarsData.weeklyResetWeek !== currentWeek && isMonday()) {
        newStarsData.stars.weekly = 0;
        newStarsData.weeklyResetWeek = currentWeek;
        newStreak.starsThisWeek = 0;
        setWeekTasks([]);
    }

    if (newStarsData.monthlyResetMonth !== currentMonth && isFirstOfMonth()) {
        newStarsData.stars.monthly = 0;
        newStarsData.monthlyResetMonth = currentMonth;
        setMonthTasks([]);
    }
    
    setStarsData(newStarsData);
    setStreak(newStreak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleResetsAndStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const openModal = (type: string, data: any = null) => {
    setModalData(data);
    setModal(type);
  };
  
  const closeModal = () => {
    setModal(null);
    setModalData(null);
  };

  const addTask = (period: TaskPeriod, text: string) => {
    if (!text.trim()) return;
    const newTask: Task = { id: crypto.randomUUID(), text: text.trim(), completed: false };
    const taskSetter = {
      [TaskPeriod.Day]: setDayTasks,
      [TaskPeriod.Week]: setWeekTasks,
      [TaskPeriod.Month]: setMonthTasks,
    }[period];

    taskSetter(prev => [...prev, newTask]);
    setStarsData(prev => ({...prev, totalTasks: prev.totalTasks + 1}));
    closeModal();
  };

  const removeTask = (period: TaskPeriod, id: string) => {
    const taskSetter = {
      [TaskPeriod.Day]: setDayTasks,
      [TaskPeriod.Week]: setWeekTasks,
      [TaskPeriod.Month]: setMonthTasks,
    }[period];
    taskSetter(prev => prev.filter(t => t.id !== id));
    setStarsData(prev => ({...prev, totalTasks: Math.max(0, prev.totalTasks - 1)}));
    closeModal();
  };

  const completeTask = (period: TaskPeriod, id: string) => {
    const taskSetter = {
      [TaskPeriod.Day]: setDayTasks,
      [TaskPeriod.Week]: setWeekTasks,
      [TaskPeriod.Month]: setMonthTasks,
    }[period];
    taskSetter(prev => prev.map(t => t.id === id ? {...t, completed: true} : t));
    setStarsData(prev => ({
      ...prev,
      stars: { ...prev.stars, [period]: prev.stars[period] + 1 },
      totalEarned: prev.totalEarned + 1
    }));
    closeModal();
  };

  const addNote = (type: 'text' | 'link', content: string) => {
    if (!content.trim()) return;
    if (type === 'link' && !/^https?:\/\//.test(content)) {
        alert("Invalid URL. Must start with http:// or https://");
        return;
    }
    const newNote: Note = { id: crypto.randomUUID(), type, content: content.trim() };
    setNotes(prev => [newNote, ...prev]);
    closeModal();
  };
  
  const editNote = (id: string, newContent: string) => {
    setNotes(prev => prev.map(n => n.id === id ? {...n, content: newContent} : n));
    closeModal();
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    closeModal();
  };

  const addTarget = (label: string, date: string) => {
    if (!label.trim() || !date) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
        alert("Invalid date format. Please use YYYY-MM-DD.");
        return;
    }
    const newTarget: TargetDate = { id: crypto.randomUUID(), label, date, startDate: getToday() };
    setTargets(prev => [...prev, newTarget]);
    // No close modal, so they can add multiple
  };

  const deleteTarget = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  const handleExport = () => {
    const dataToExport: { [key: string]: any } = {};
    LOCAL_STORAGE_KEYS.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
            dataToExport[key] = JSON.parse(item);
        }
    });
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `zenith-task-tracker-backup-${getToday()}.json`;
    link.click();
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        LOCAL_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    }
  };


  return (
    <div className="min-h-screen p-2 sm:p-4 lg:p-6 space-y-4 max-w-7xl mx-auto">
        {/* Header Area */}
        <div className="flex justify-between items-start gap-4">
            <Widget className="w-full">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-md font-mono text-slate-300">
                    <span className="flex items-center gap-2 text-yellow-400"><StarIcon/>EARNED:</span>
                    <span className="flex items-center gap-1"><SunIcon/>Day: {starsData.stars.daily}</span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1"><WeekIcon/>Week: {starsData.stars.weekly}</span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1"><MoonIcon/>Month: {starsData.stars.monthly}</span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1">Total<StarIcon className="text-yellow-400 w-4 h-4 mx-1"/>: {starsData.totalEarned}/{starsData.totalTasks}</span>
                </div>
            </Widget>
            <div className="flex gap-2 pt-2">
                 <button onClick={handleExport} title="Export Data" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <ExportIcon className="w-6 h-6"/>
                </button>
                <button onClick={handleReset} title="Reset All Data" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                    <ResetIcon className="w-6 h-6"/>
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-4">
                <CalendarWidget currentDate={currentDate} onHeaderClick={() => openModal('manage-targets')} />
                <div className="flex gap-4">
                  <StreakWidget streak={streak}/>
                  <CountdownWidget targets={targets}/>
                </div>
            </div>
            <div className="lg:col-span-2">
                <NotesWidget notes={notes} onAddClick={() => openModal('add-note')} onNoteClick={(note) => openModal('manage-note', { note })}/>
            </div>
        </div>

        {/* Task Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TaskWidget period={TaskPeriod.Day} tasks={dayTasks} onAreaClick={() => openModal('add-task', {period: TaskPeriod.Day})} onTaskClick={(task) => openModal('manage-task', {task, period: TaskPeriod.Day})}/>
            <TaskWidget period={TaskPeriod.Week} tasks={weekTasks} onAreaClick={() => openModal('add-task', {period: TaskPeriod.Week})} onTaskClick={(task) => openModal('manage-task', {task, period: TaskPeriod.Week})} />
            <TaskWidget period={TaskPeriod.Month} tasks={monthTasks} onAreaClick={() => openModal('add-task', {period: TaskPeriod.Month})} onTaskClick={(task) => openModal('manage-task', {task, period: TaskPeriod.Month})}/>
        </div>
        
        {/* Modals */}
        <RenderModals 
            modal={modal} 
            closeModal={closeModal} 
            modalData={modalData}
            notes={notes}
            targets={targets}
            onAddTask={addTask}
            onRemoveTask={removeTask}
            onCompleteTask={completeTask}
            onAddNote={addNote}
            onEditNote={editNote}
            onDeleteNote={deleteNote}
            onAddTarget={addTarget}
            onDeleteTarget={deleteTarget}
        />
    </div>
  );
}

// --- Modal Rendering Logic (Helper Component) ---
const RenderModals = (props: {
    modal: string | null; closeModal: () => void; modalData: any; notes: Note[]; targets: TargetDate[];
    onAddTask: (period: TaskPeriod, text: string) => void; onRemoveTask: (period: TaskPeriod, id: string) => void; onCompleteTask: (period: TaskPeriod, id: string) => void;
    onAddNote: (type: 'text' | 'link', content: string) => void; onEditNote: (id: string, newContent: string) => void; onDeleteNote: (id: string) => void;
    onAddTarget: (label: string, date: string) => void; onDeleteTarget: (id: string) => void;
}) => {
    const { modal, closeModal, modalData, notes, targets, onAddTask, onRemoveTask, onCompleteTask, onAddNote, onEditNote, onDeleteNote, onAddTarget, onDeleteTarget } = props;
    
    const [text, setText] = useState('');
    const [noteType, setNoteType] = useState<'text'|'link'>('text');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (modal) {
            setText(modalData?.note?.content || modalData?.task?.text || '');
            setDate('');
            setNoteType(modalData?.note?.type || 'text');
        }
    }, [modal, modalData]);
    
    const renderModalContent = () => {
        const commonInputClass = "bg-slate-800 border border-slate-700 text-white rounded p-2 w-full focus:ring-slate-500 focus:border-slate-500 placeholder-slate-500";
        const btnClass = "bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded w-full transition-colors";

        switch(modal) {
            case 'add-task':
                return <form onSubmit={(e) => { e.preventDefault(); onAddTask(modalData.period, text);}} className="space-y-4">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="New task description..." className={commonInputClass} autoFocus/>
                    <button type="submit" className={btnClass}>Add Task</button>
                </form>;
            
            case 'manage-task':
                if (!modalData?.task) return null;
                return <div className="space-y-4">
                    <p className={`p-2 bg-slate-800/50 rounded break-words ${modalData.task.completed ? 'line-through text-slate-500' : ''}`}>"{modalData.task.text}"</p>
                    
                    {modalData.task.completed ? (
                         <div className="text-center py-2">
                            <p className="text-slate-400">Task completed!</p>
                            <p className="text-xs text-slate-500">It will be cleared on the next reset.</p>
                         </div>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => onCompleteTask(modalData.period, modalData.task.id)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-1/2 transition-colors">Mark Complete</button>
                            <button onClick={() => onRemoveTask(modalData.period, modalData.task.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-1/2 transition-colors">Delete Task</button>
                        </div>
                    )}
                </div>;

            case 'add-note':
                return <form onSubmit={e => { e.preventDefault(); onAddNote(noteType, text); }} className="space-y-4">
                    <select value={noteType} onChange={e => setNoteType(e.target.value as 'text'|'link')} className={commonInputClass}>
                        <option value="text">Text Note</option>
                        <option value="link">Link (URL)</option>
                    </select>
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder={noteType === 'link' ? "https://..." : "Note content..."} className={`${commonInputClass} h-32`} autoFocus/>
                    <button type="submit" className={btnClass}>Add Note</button>
                </form>;
            
            case 'manage-note':
                return <form onSubmit={e => { e.preventDefault(); onEditNote(modalData.note.id, text); }} className="space-y-4">
                    <textarea value={text} onChange={e => setText(e.target.value)} className={`${commonInputClass} h-32`} autoFocus/>
                    <div className="flex gap-4">
                        <button type="submit" className={`w-1/2 ${btnClass}`}>Update</button>
                        <button type="button" onClick={() => onDeleteNote(modalData.note.id)} className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">Delete</button>
                    </div>
                </form>;

            case 'manage-targets':
                return <div className="space-y-6">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        <h3 className="text-lg text-slate-400">Existing Targets</h3>
                        {targets.length > 0 ? targets.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                                <div>
                                    <p>{t.label}</p>
                                    <p className="text-xs text-slate-500 font-mono">{t.date}</p>
                                </div>
                                <button onClick={() => onDeleteTarget(t.id)} className="text-red-500 hover:text-red-400 text-xl">&times;</button>
                            </div>
                        )) : <p className="text-slate-500 text-sm">No countdowns set.</p>}
                    </div>
                    <form onSubmit={e => { e.preventDefault(); onAddTarget(text, date); setText(''); setDate(''); }} className="space-y-4 border-t border-slate-700 pt-4">
                         <h3 className="text-lg text-slate-400">Add New Target</h3>
                         <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Countdown label" className={commonInputClass} autoFocus/>
                         <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${commonInputClass} font-mono`}/>
                         <button type="submit" className={btnClass}>Set Target</button>
                    </form>
                </div>;

            default: return null;
        }
    }
    
    const getModalTitle = () => {
        if(!modal) return '';
        if (modal === 'add-task') return `Add ${modalData.period.charAt(0).toUpperCase() + modalData.period.slice(1)} Task`;
        if (modal === 'manage-task') return 'Manage Task';
        if (modal === 'manage-note') return 'Manage Note';
        if (modal === 'manage-targets') return 'Manage Countdowns';
        return modal?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return (
        <Modal isOpen={!!modal} onClose={closeModal} title={getModalTitle()}>
            {renderModalContent()}
        </Modal>
    );
};

export default App;