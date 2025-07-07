// src/components/modals.js
import React, { useState, useEffect } from 'react';
import { Modal } from './common.js';
import { ImportIcon, ExportIcon } from './icons.js';

export const RenderModals = (props) => {
    const { modal, closeModal, modalData, notes, targets, onAddTask, onRemoveTask, onCompleteTask, onAddNote, onEditNote, onDeleteNote, onAddTarget, onDeleteTarget, onExport, onTriggerImport } = props;
    
    const [text, setText] = useState('');
    const [noteType, setNoteType] = useState('text');
    const [date, setDate] = useState('');

    useEffect(() => {
        if (modal) {
            setText(modalData?.note?.content || modalData?.task?.text || '');
            setDate('');
            setNoteType(modalData?.note?.type || 'text');
        }
    }, [modal, modalData]);
    
    const commonInputClass = "bg-input-bg border border-input-border text-text-primary rounded p-2 w-full focus:ring-text-secondary focus:border-text-secondary placeholder-input-placeholder";
    const btnClass = "bg-button-bg hover:bg-button-hover text-text-primary font-bold py-2 px-4 rounded w-full transition-colors";
    const ioBtnClass = "w-full flex items-center justify-center gap-3 bg-button-bg hover:bg-button-hover text-text-primary font-bold py-3 px-4 rounded transition-colors";
    const dangerBtnClass = "bg-button-danger hover:bg-button-danger-hover text-white font-bold py-2 px-4 rounded w-1/2 transition-colors";
    const successBtnClass = "bg-button-success hover:bg-button-success-hover text-white font-bold py-2 px-4 rounded w-1/2 transition-colors";

    const renderModalContent = () => {
        switch(modal) {
            case 'add-task':
                return <form onSubmit={(e) => { e.preventDefault(); onAddTask(modalData.period, text);}} className="space-y-4">
                    <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="New task description..." className={commonInputClass} autoFocus/>
                    <button type="submit" className={btnClass}>Add Task</button>
                </form>;
            
            case 'manage-task':
                if (!modalData?.task) return null;
                return <div className="space-y-4">
                    <p className={`p-2 bg-input-bg rounded break-words ${modalData.task.completed ? 'line-through text-text-secondary' : ''}`}>"{modalData.task.text}"</p>
                    
                    {modalData.task.completed ? (
                            <div className="text-center py-2">
                                <p className="text-text-secondary">Task completed!</p>
                                <p className="text-xs text-text-secondary">It will be cleared on the next reset.</p>
                            </div>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={() => onCompleteTask(modalData.period, modalData.task.id)} className={successBtnClass}>Mark Complete</button>
                            <button onClick={() => onRemoveTask(modalData.period, modalData.task.id)} className={dangerBtnClass}>Delete Task</button>
                        </div>
                    )}
                </div>;

            case 'add-note':
                return <form onSubmit={e => { e.preventDefault(); onAddNote(noteType, text); }} className="space-y-4">
                    <select value={noteType} onChange={e => setNoteType(e.target.value)} className={commonInputClass}>
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
                        <button type="button" onClick={() => onDeleteNote(modalData.note.id)} className={`w-1/2 ${dangerBtnClass}`}>Delete</button>
                    </div>
                </form>;

            case 'manage-targets':
                return <div className="space-y-6">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        <h3 className="text-lg text-text-secondary">Existing Targets</h3>
                        {targets.length > 0 ? targets.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-input-bg p-2 rounded">
                                <div>
                                    <p>{t.label}</p>
                                    <p className="text-xs text-text-secondary font-mono">{t.date}</p>
                                </div>
                                <button onClick={() => onDeleteTarget(t.id)} className="text-button-danger hover:text-button-danger-hover text-xl">&times;</button>
                            </div>
                        )) : <p className="text-text-secondary text-sm">No countdowns set.</p>}
                    </div>
                    <form onSubmit={e => { e.preventDefault(); onAddTarget(text, date); setText(''); setDate(''); }} className="space-y-4 border-t border-input-border pt-4">
                            <h3 className="text-lg text-text-secondary">Add New Target</h3>
                            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Countdown label" className={commonInputClass} autoFocus/>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${commonInputClass} font-mono`}/>
                            <button type="submit" className={btnClass}>Set Target</button>
                        </form>
                </div>;
            
            case 'data-io':
                return <div className="space-y-4">
                    <p className="text-sm text-text-secondary">Importing data will overwrite all of your current tasks, notes, and settings. This action cannot be undone.</p>
                    <button onClick={onTriggerImport} className={ioBtnClass}>
                        <ImportIcon className="w-5 h-5"/>
                        Import from Backup
                    </button>
                    <button onClick={() => { onExport(); closeModal(); }} className={ioBtnClass}>
                        <ExportIcon className="w-5 h-5"/>
                        Export to Backup
                    </button>
                </div>;

            case 'message':
                return (
                    <div className="space-y-4">
                        <p className="text-text-primary">{modalData.message}</p>
                        <button onClick={() => { closeModal(); if (modalData.onClose) modalData.onClose(); }} className={btnClass}>OK</button>
                    </div>
                );

            case 'confirm':
                return (
                    <div className="space-y-4">
                        <p className="text-text-primary">{modalData.message}</p>
                        <div className="flex gap-4">
                            <button onClick={() => { modalData.onConfirm(); closeModal(); }} className={dangerBtnClass}>Confirm</button>
                            <button onClick={() => { modalData.onCancel(); closeModal(); }} className={btnClass}>Cancel</button>
                        </div>
                    </div>
                );

            default: return null;
        }
    }
    
    const getModalTitle = () => {
        if(!modal) return '';
        if (modal === 'add-task') return `Add ${modalData.period.charAt(0).toUpperCase() + modalData.period.slice(1)} Task`;
        if (modal === 'manage-task') return 'Manage Task';
        if (modal === 'manage-note') return 'Manage Note';
        if (modal === 'manage-targets') return 'Manage Countdowns';
        if (modal === 'data-io') return 'Import / Export Data';
        if (modal === 'message' || modal === 'confirm') return modalData.title;
        return modal?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    return (
        <Modal isOpen={!!modal} onClose={closeModal} title={getModalTitle()}>
            {renderModalContent()}
        </Modal>
    );
};
