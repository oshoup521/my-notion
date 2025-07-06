import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiTag, FiBarChart2, FiColumns, FiHome, FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import axios from 'axios';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const statusColumns = {
  todo: { title: 'To Do', color: 'bg-gray-50', icon: FiClock },
  in_progress: { title: 'In Progress', color: 'bg-blue-50', icon: FiAlertCircle },
  done: { title: 'Done', color: 'bg-green-50', icon: FiCheckCircle }
};

// Navigation Component
const Navigation = ({ activeView, onViewChange }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`nav-item ${activeView === 'dashboard' ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <FiBarChart2 className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`nav-item ${activeView === 'kanban' ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <FiKanban className="w-4 h-4 mr-2" />
              Kanban
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onEdit, onDelete }) => {
  const IconComponent = statusColumns[task.status].icon;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:transform hover:translate-y-[-2px]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <IconComponent className="w-4 h-4 text-gray-500 mr-2" />
          <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(task)}
            className="text-gray-400 hover:text-purple-600 p-1 rounded-full hover:bg-purple-50"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <FiTag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {task.tags.join(', ')}
              </span>
            </div>
          )}
        </div>
        {task.due_date && (
          <div className="flex items-center text-xs text-gray-500">
            <FiCalendar className="w-3 h-3 mr-1" />
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {task.checklist && task.checklist.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">
            {task.checklist.filter(item => item.completed).length} / {task.checklist.length} completed
          </div>
          <div className="space-y-1">
            {task.checklist.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className={`w-3 h-3 rounded-full mr-2 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                  {item.text}
                </span>
              </div>
            ))}
            {task.checklist.length > 3 && (
              <div className="text-xs text-gray-400">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add tag"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add checklist item"
              />
              <button
                onClick={addChecklistItem}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.checklist.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl">
                  <span className="text-sm">{item.text}</span>
                  <button
                    onClick={() => removeChecklistItem(index)}
                    className="text-red-500 hover:text-red-700"
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
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
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

  const handleEditTask = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      onTaskUpdate(editingTask.id, taskData);
    } else {
      onTaskCreate(taskData);
    }
  };

  const tasksByStatus = {
    todo: tasks.filter(task => task.status === 'todo'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done')
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        <button
          onClick={handleCreateTask}
          className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(statusColumns).map(([status, { title, color }]) => (
            <div key={status} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  {tasksByStatus[status].length}
                </span>
              </div>
              
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] rounded-xl p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-purple-50' : color
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
                              onEdit={handleEditTask}
                              onDelete={onTaskDelete}
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
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
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    task.status === 'done' ? 'bg-green-500' : 
                    task.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className="font-medium text-gray-900">{task.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500">
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
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    priority_breakdown: { low: 0, medium: 0, high: 0 },
    tag_breakdown: {}
  });
  const [activeView, setActiveView] = useState('kanban');

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
    <div className="min-h-screen bg-gray-50">
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

export default App;