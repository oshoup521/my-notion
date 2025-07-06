import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiTag, FiBarChart2, FiColumns, FiHome, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';
import './App.css';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const statusColumns = {
  todo: { title: 'To Do', color: 'bg-gray-50', icon: FiClock },
  in_progress: { title: 'In Progress', color: 'bg-blue-50', icon: FiAlertCircle },
  done: { title: 'Done', color: 'bg-green-50', icon: FiCheckCircle }
};

// Navigation Component
const Navigation = ({ activeView, onViewChange }) => {
  return (
    <div className="bg-white dark:bg-darksurface shadow-sm border-b border-gray-200 dark:border-darkborder transition-colors duration-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src="/logo.svg" alt="TaskFlow Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-darktext bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">TaskFlow</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <button
                onClick={() => onViewChange('dashboard')}
                className={`nav-item ${activeView === 'dashboard' ? 'nav-item-active dark:bg-purple-900 dark:text-purple-200' : 'nav-item-inactive dark:text-darktextsecondary dark:hover:text-darktext dark:hover:bg-darkborder'}`}
              >
                <FiBarChart2 className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => onViewChange('kanban')}
                className={`nav-item ${activeView === 'kanban' ? 'nav-item-active dark:bg-purple-900 dark:text-purple-200' : 'nav-item-inactive dark:text-darktextsecondary dark:hover:text-darktext dark:hover:bg-darkborder'}`}
              >
                <FiColumns className="w-4 h-4 mr-2" />
                Kanban
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete, onDuplicate, onArchive, onRestore }) => {
  const IconComponent = statusColumns[task.status].icon;
  
  return (
    <div className={`bg-white dark:bg-darksurface rounded-xl shadow-sm border border-gray-200 dark:border-darkborder p-4 hover:shadow-md transition-all duration-200 hover:transform hover:translate-y-[-2px] ${task.archived ? 'opacity-70' : ''}`}>
      {task.archived && (
        <div className="flex items-center justify-center mb-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs py-1 px-2 rounded">
          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Archived
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="font-semibold text-gray-900 dark:text-darktext text-sm">{task.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {!task.archived ? (
            <>
              <button
                onClick={() => onEdit(task)}
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDuplicate(task)}
                className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-1 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30"
                title="Duplicate task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => onArchive(task)}
                className="text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 p-1 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/30"
                title="Archive task"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => onRestore(task)}
              className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 p-1 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
              title="Restore task"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 dark:text-darktextsecondary text-sm mb-3">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <FiTag className="w-3 h-3 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {task.tags.join(', ')}
              </span>
            </div>
          )}
        </div>
        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {task.checklist && task.checklist.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-darkborder">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {task.checklist.filter(item => item.completed).length} / {task.checklist.length} completed
          </div>
          <div className="space-y-1">
            {task.checklist.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className={`w-3 h-3 rounded-full mr-2 ${item.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <span className={item.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                  {item.text}
                </span>
              </div>
            ))}
            {task.checklist.length > 3 && (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                +{task.checklist.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Task Form Modal
const TaskModal = ({ task, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: [],
    due_date: '',
    checklist: []
  });

  const [newTag, setNewTag] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        tags: task.tags || [],
        due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        checklist: task.checklist || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        due_date: '',
        checklist: []
      });
    }
  }, [task]);

  const handleSave = () => {
    onSave({
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, {
          id: Date.now().toString(),
          text: newChecklistItem.trim(),
          completed: false
        }]
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, index) => index !== indexToRemove)
    }));
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-white dark:bg-darksurface rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-darktext">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 h-20 resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Due Date</label>
            <div className="relative">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 [color-scheme:auto]"
              />
              <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                placeholder="Add tag"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-purple-500 dark:bg-darkprimary text-white rounded-xl hover:bg-purple-600 dark:hover:bg-darkprimaryhover min-w-[80px]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-darktextsecondary mb-2">Checklist</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
                placeholder="Add checklist item"
              />
              <button
                onClick={addChecklistItem}
                className="px-4 py-2 bg-purple-500 dark:bg-darkprimary text-white rounded-xl hover:bg-purple-600 dark:hover:bg-darkprimaryhover min-w-[80px]"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.checklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-darkbg p-2 rounded-xl">
                  <span className="text-sm dark:text-darktext">{item.text}</span>
                  <button
                    onClick={() => removeChecklistItem(index)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkborder rounded-xl flex-1 md:flex-none"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-500 dark:bg-darkprimary text-white rounded-xl hover:bg-purple-600 dark:hover:bg-darkprimaryhover flex-1 md:flex-none"
          >
            {task ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Kanban Board Component
const KanbanBoard = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    onTaskUpdate(taskId, { status: newStatus });
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };
  
  const handleDuplicateTask = (task) => {
    // Create a copy of the task with a new title and without the _id
    const duplicatedTask = {
      ...task,
      title: `${task.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    delete duplicatedTask._id;
    
    // Create the duplicated task
    onTaskCreate(duplicatedTask);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      onTaskUpdate(editingTask.id, taskData);
    } else {
      onTaskCreate(taskData);
    }
  };
  
  // Filter tasks based on search term, filters, and archive status
  const filteredTasks = tasks.filter(task => {
    // Archive filter
    const matchesArchiveFilter = showArchived ? task.archived : !task.archived;
    
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Priority filter
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    // Status filter - this is handled by the column display, but we'll keep it for consistency
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    
    return matchesArchiveFilter && matchesSearch && matchesPriority && matchesStatus;
  });
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || filterPriority !== 'all' || filterStatus !== 'all';
  
  // Sort the filtered tasks
  const sortedAndFilteredTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'priority':
        // Custom priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'due_date':
        // Handle null due dates (tasks without due dates appear last when sorting by due date)
        if (!a.due_date && !b.due_date) comparison = 0;
        else if (!a.due_date) comparison = 1;
        else if (!b.due_date) comparison = -1;
        else comparison = new Date(a.due_date) - new Date(b.due_date);
        break;
      case 'created_at':
        comparison = new Date(a.created_at) - new Date(b.created_at);
        break;
      case 'updated_at':
      default:
        comparison = new Date(a.updated_at) - new Date(b.updated_at);
        break;
    }
    
    // Apply sort direction
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  const tasksByStatus = {
    todo: sortedAndFilteredTasks.filter(task => task.status === 'todo'),
    in_progress: sortedAndFilteredTasks.filter(task => task.status === 'in_progress'),
    done: sortedAndFilteredTasks.filter(task => task.status === 'done')
  };

  // Clear all filters function
  const clearFilters = () => {
    setSearchTerm('');
    setFilterPriority('all');
    setFilterStatus('all');
  };

  // Handle archiving a task
  const handleArchiveTask = (task) => {
    const updatedTask = { ...task, archived: true };
    onTaskUpdate(updatedTask);
  };
  
  // Handle restoring an archived task
  const handleRestoreTask = (task) => {
    const updatedTask = { ...task, archived: false };
    onTaskUpdate(updatedTask);
  };
  

  
  // Export tasks function
  const exportTasks = (format) => {
    let dataStr;
    let filename;
    
    if (format === 'json') {
      dataStr = JSON.stringify(sortedAndFilteredTasks, null, 2);
      filename = `my-notion-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    } else if (format === 'csv') {
      // Create CSV header
      const headers = ['id', 'title', 'description', 'status', 'priority', 'due_date', 'tags', 'checklist', 'created_at', 'updated_at'];
      
      // Convert tasks to CSV rows
      const rows = sortedAndFilteredTasks.map(task => {
        return [
          task._id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          task.status,
          task.priority,
          task.due_date || '',
          `"${(task.tags || []).join(', ')}"`,
          `"${(task.checklist || []).map(item => `${item.text}${item.completed ? ' (✓)' : ''}`).join(', ')}"`,
          task.created_at,
          task.updated_at
        ].join(',');
      });
      
      // Combine header and rows
      dataStr = [headers.join(','), ...rows].join('\n');
      filename = `my-notion-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    }
    
    // Create download link
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    setExportModalOpen(false);
  };
  


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-darktext">Kanban Board</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setExportModalOpen(true)}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-darktext px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors duration-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
          <button
            onClick={handleCreateTask}
            className="flex items-center px-4 py-2 bg-purple-500 dark:bg-darkprimary text-white rounded-xl hover:bg-purple-600 dark:hover:bg-darkprimaryhover transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-darksurface rounded-xl shadow-sm border border-gray-200 dark:border-darkborder p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-darktextsecondary">Filter Tasks</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
              >
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`text-xs flex items-center px-2 py-1 rounded-full transition-colors ${showArchived 
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}
            >
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {showArchived ? 'Showing Archived' : 'Show Archived'}
            </button>
            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-darkborder dark:bg-darkbg dark:text-darktext rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          
          {/* Sort Controls */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-darktext mb-1">Sort By</label>
            <div className="flex space-x-2">
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-darkbg dark:text-darktext sm:text-sm"
              >
                <option value="updated_at">Last Updated</option>
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
              </select>
              <button 
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-darkbg hover:bg-gray-50 dark:hover:bg-gray-800"
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? (
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(statusColumns).map(([status, { title, color }]) => (
            <div key={status} className="bg-white dark:bg-darksurface rounded-2xl shadow-sm border border-gray-200 dark:border-darkborder p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-darktext">{title}</h3>
                <span className="bg-gray-100 dark:bg-darkbg text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-sm">
                  {tasksByStatus[status].length}
                </span>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] rounded-xl p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-purple-50 dark:bg-purple-900/20' : `${color} dark:bg-darkbg/50`
                    }`}
                  >
                    {tasksByStatus[status].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 ${
                              snapshot.isDragging ? 'transform rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <TaskCard
                               task={task}
                               onEdit={handleTaskClick}
                               onDelete={onTaskDelete}
                               onDuplicate={handleDuplicateTask}
                               onArchive={handleArchiveTask}
                               onRestore={handleRestoreTask}
                             />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
      />
      
      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-darksurface rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-darktext">Export Tasks</h3>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Export {sortedAndFilteredTasks.length} {sortedAndFilteredTasks.length === 1 ? 'task' : 'tasks'} in your preferred format.
              {hasActiveFilters && ' (Filtered view)'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={() => exportTasks('json')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-gray-900 dark:text-darktext font-medium">JSON</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Full data</span>
              </button>
              
              <button
                onClick={() => exportTasks('csv')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-gray-900 dark:text-darktext font-medium">CSV</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet</span>
              </button>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ tasks, stats }) => {
  const statusData = [
    { name: 'To Do', value: stats.todo, color: '#8b5cf6' },
    { name: 'In Progress', value: stats.in_progress, color: '#3b82f6' },
    { name: 'Done', value: stats.done, color: '#10b981' }
  ];

  const priorityData = [
    { name: 'Low', value: stats.priority_breakdown.low, color: '#10b981' },
    { name: 'Medium', value: stats.priority_breakdown.medium, color: '#f59e0b' },
    { name: 'High', value: stats.priority_breakdown.high, color: '#ef4444' }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-darktext mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card stats-card-total">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Total Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FiHome className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="stats-card stats-card-todo">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">To Do</p>
              <p className="text-2xl font-bold text-white">{stats.todo}</p>
            </div>
            <FiClock className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="stats-card stats-card-progress">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">In Progress</p>
              <p className="text-2xl font-bold text-white">{stats.in_progress}</p>
            </div>
            <FiAlertCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="stats-card stats-card-completed">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.done}</p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-darksurface rounded-2xl shadow-sm border border-gray-200 dark:border-darkborder p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-darktext mb-4">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#ccc' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-darksurface rounded-2xl shadow-sm border border-gray-200 dark:border-darkborder p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-darktext mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: '#ccc' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-darktext mb-4">Recent Tasks</h3>
        <div className="bg-white dark:bg-darksurface rounded-2xl shadow-sm border border-gray-200 dark:border-darkborder p-6">
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-darkbg rounded-xl">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    task.status === 'done' ? 'bg-green-500' : 
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900 dark:text-darktext">{task.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]} dark:bg-opacity-20 dark:text-opacity-90`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {statusColumns[task.status].title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    priority_breakdown: { low: 0, medium: 0, high: 0 },
    tag_breakdown: {}
  });
  const [activeView, setActiveView] = useState('kanban');
  const { darkMode } = useTheme();

  // Load tasks and stats
  const loadTasks = async () => {
    try {
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
      
      const statsResponse = await axios.get(`${API}/tasks/stats`);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  // Create task
  const createTask = async (taskData) => {
    try {
      await axios.post(`${API}/tasks`, taskData);
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Update task
  const updateTask = async (taskId, updateData) => {
    try {
      await axios.put(`${API}/tasks/${taskId}`, updateData);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-darkbg ${darkMode ? 'dark' : ''}`}>
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      
      <main className="max-w-7xl mx-auto">
        {activeView === 'dashboard' && (
          <Dashboard tasks={tasks} stats={stats} />
        )}
        {activeView === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onTaskUpdate={updateTask}
            onTaskCreate={createTask}
            onTaskDelete={deleteTask}
          />
        )}
      </main>
    </div>
  );
};

const AppWithTheme = () => {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
};

export default AppWithTheme;