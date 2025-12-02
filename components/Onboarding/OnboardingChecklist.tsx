
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnboardingRecord, ChecklistGroup, OnboardingTask, UserRole } from '../../types';
import { Plus, CheckSquare, Square, Trash2 } from 'lucide-react';

interface Props {
  record: OnboardingRecord;
}

const GROUPS: ChecklistGroup[] = ['HR Checklist', 'IT Checklist', 'Admin Checklist', 'Manager Checklist'];

export const OnboardingChecklist: React.FC<Props> = ({ record }) => {
  const { updateOnboarding, userRole, currentUser } = useApp();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeGroup, setActiveGroup] = useState<ChecklistGroup>('HR Checklist');

  const tasks = record.tasks || [];

  // Permission check: can user edit this task?
  const canEditTask = (task: OnboardingTask) => {
    if (userRole === UserRole.COMPANY_ADMIN) return true;
    if (userRole === UserRole.MANAGER && task.group === 'Manager Checklist') return true;
    // For now IT/Admin roles are simulated via HR or generic logic, but we can add specific checks
    return false;
  };

  // Permission check: can user add tasks to this group?
  const canAdd = (group: ChecklistGroup) => {
     if (userRole === UserRole.COMPANY_ADMIN) return true;
     if (userRole === UserRole.MANAGER && group === 'Manager Checklist') return true;
     return false;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: OnboardingTask = {
      id: `task-${Date.now()}`,
      group: activeGroup,
      title: newTaskTitle,
      assignedToRole: activeGroup.split(' ')[0], // 'HR', 'IT', etc.
      status: 'Pending'
    };

    updateOnboarding({
      ...record,
      tasks: [...tasks, newTask]
    });
    setNewTaskTitle('');
  };

  const toggleStatus = (task: OnboardingTask) => {
    if (!canEditTask(task)) return;
    
    const newStatus: OnboardingTask['status'] = task.status === 'Completed' ? 'Pending' : 'Completed';
    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
         return { 
           ...t, 
           status: newStatus, 
           completedOn: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined,
           completedBy: newStatus === 'Completed' ? currentUser.name : undefined
         };
      }
      return t;
    });

    updateOnboarding({ ...record, tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
     if (window.confirm('Delete this task?')) {
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        updateOnboarding({ ...record, tasks: updatedTasks });
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       {/* Sidebar Navigation for Groups */}
       <div className="space-y-1">
          {GROUPS.map(group => (
             <button
                key={group}
                onClick={() => setActiveGroup(group)}
                className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors flex justify-between items-center
                   ${activeGroup === group ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                {group}
                <span className="bg-white border text-xs px-2 py-0.5 rounded-full text-slate-500">
                   {tasks.filter(t => t.group === group && t.status === 'Completed').length} / {tasks.filter(t => t.group === group).length}
                </span>
             </button>
          ))}
       </div>

       {/* Task List Content */}
       <div className="lg:col-span-3">
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center justify-between">
                {activeGroup}
                {canAdd(activeGroup) && (
                   <form onSubmit={handleAddTask} className="flex gap-2 w-full max-w-md">
                      <input 
                        type="text" 
                        className="flex-1 text-sm border-slate-300 rounded-md p-1.5" 
                        placeholder="New task..." 
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                      />
                      <button type="submit" className="bg-indigo-600 text-white p-1.5 rounded-md hover:bg-indigo-700">
                         <Plus className="w-4 h-4" />
                      </button>
                   </form>
                )}
             </h3>

             <div className="space-y-2">
                {tasks.filter(t => t.group === activeGroup).length === 0 ? (
                   <div className="text-center text-slate-400 text-sm py-4">No tasks in this checklist.</div>
                ) : (
                   tasks.filter(t => t.group === activeGroup).map(task => (
                      <div key={task.id} className={`flex items-start p-3 bg-white rounded border transition-all ${task.status === 'Completed' ? 'border-green-200 bg-green-50' : 'border-slate-200'}`}>
                         <button 
                           onClick={() => toggleStatus(task)}
                           disabled={!canEditTask(task)}
                           className={`mt-0.5 mr-3 flex-shrink-0 ${canEditTask(task) ? 'cursor-pointer text-slate-400 hover:text-indigo-600' : 'cursor-not-allowed opacity-50'}`}
                         >
                            {task.status === 'Completed' ? <CheckSquare className="w-5 h-5 text-green-600" /> : <Square className="w-5 h-5" />}
                         </button>
                         
                         <div className="flex-1">
                            <div className={`text-sm font-medium ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                               {task.title}
                            </div>
                            {task.status === 'Completed' && (
                               <div className="text-xs text-green-600 mt-1">Completed by {task.completedBy} on {task.completedOn}</div>
                            )}
                         </div>
                         
                         {canEditTask(task) && (
                            <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-600 ml-2">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         )}
                      </div>
                   ))
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
