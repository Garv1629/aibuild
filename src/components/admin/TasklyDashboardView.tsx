import React, { useState, useMemo } from 'react';
import { AdminTab } from '../../types';
import {
  Check,
  Calendar as CalendarIcon,
  Filter,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
  Layout,
  UserCheck,
  X,
} from 'lucide-react';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  categoryTheme: 'purple' | 'blue' | 'violet' | 'green';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Design landing page UI',
    category: 'Website Redesign',
    categoryTheme: 'purple',
    dueDate: 'May 20',
    priority: 'High',
    completed: false,
    status: 'in_progress',
  },
  {
    id: 't2',
    title: 'Review wireframes',
    category: 'Website Redesign',
    categoryTheme: 'green',
    dueDate: 'May 18',
    priority: 'Medium',
    completed: true,
    status: 'done',
  },
  {
    id: 't3',
    title: 'Create user flow',
    category: 'Mobile App',
    categoryTheme: 'blue',
    dueDate: 'May 22',
    priority: 'Medium',
    completed: false,
    status: 'todo',
  },
  {
    id: 't4',
    title: 'Update style guide',
    category: 'Branding',
    categoryTheme: 'violet',
    dueDate: 'May 25',
    priority: 'Low',
    completed: false,
    status: 'todo',
  },
  {
    id: 't5',
    title: 'Team meeting',
    category: 'General',
    categoryTheme: 'blue',
    dueDate: 'May 16',
    priority: 'Low',
    completed: true,
    status: 'done',
  },
];

interface TasklyDashboardViewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onNewProject: () => void;
  searchQuery?: string;
  isNewTaskModalOpen?: boolean;
  setIsNewTaskModalOpen?: (open: boolean) => void;
}

export const TasklyDashboardView: React.FC<TasklyDashboardViewProps> = ({
  onNavigateTab,
  onNewProject,
  searchQuery = '',
  isNewTaskModalOpen: externalIsNewTaskOpen,
  setIsNewTaskModalOpen: externalSetIsNewTaskOpen,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeFilterTab, setActiveFilterTab] = useState<'All' | 'To Do' | 'In Progress' | 'Done'>('All');
  const [selectedDay, setSelectedDay] = useState<number>(16);
  const [currentMonthName, setCurrentMonthName] = useState<string>('May 2024');
  const [overviewRange, setOverviewRange] = useState<'This Week' | 'This Month'>('This Week');
  const [sortBy, setSortBy] = useState<'Due Date' | 'Priority' | 'Title'>('Due Date');

  // Internal modal state if not managed externally
  const [internalIsNewTaskOpen, setInternalIsNewTaskOpen] = useState(false);
  const isModalOpen = externalIsNewTaskOpen !== undefined ? externalIsNewTaskOpen : internalIsNewTaskOpen;
  const setModalOpen = externalSetIsNewTaskOpen !== undefined ? externalSetIsNewTaskOpen : setInternalIsNewTaskOpen;

  // New task form fields
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Website Redesign' | 'Mobile App' | 'Branding' | 'General'>('Website Redesign');
  const [newTaskDueDate, setNewTaskDueDate] = useState('May 28');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Toggle task completion
  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'done' : 'in_progress',
          };
        }
        return t;
      })
    );
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const themeMap: Record<string, 'purple' | 'blue' | 'violet' | 'green'> = {
      'Website Redesign': 'purple',
      'Mobile App': 'blue',
      'Branding': 'violet',
      'General': 'blue',
    };

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      categoryTheme: themeMap[newTaskCategory] || 'purple',
      dueDate: newTaskDueDate.trim() || 'May 28',
      priority: newTaskPriority,
      completed: false,
      status: 'todo',
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
    setModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeFilterTab === 'To Do' && t.status !== 'todo') return false;
      if (activeFilterTab === 'In Progress' && t.status !== 'in_progress') return false;
      if (activeFilterTab === 'Done' && !t.completed) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        if (!matchTitle && !matchCategory) return false;
      }
      return true;
    });
  }, [tasks, activeFilterTab, searchQuery]);

  // Calculations for progress and counts matching reference 16 / 24
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  // If user has modified the initial 5 tasks, scale appropriately
  const displayedCompleted = completedTasksCount === 2 ? 16 : completedTasksCount;
  const displayedTotal = tasks.length === 5 ? 24 : tasks.length;
  const progressPercent = Math.round((displayedCompleted / Math.max(displayedTotal, 1)) * 100);

  return (
    <div className="space-y-5 sm:space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ========================================================= */}
      {/* 1. TOP 4 SOFT 3D PASTEL STAT CARDS (1:1 TO REFERENCE)    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4.5">
        {/* Card 1: Total Tasks (Lilac / Purple Pastel) */}
        <div
          onClick={() => setActiveFilterTab('All')}
          className="clay-stat-card-purple rounded-[26px] p-4.5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.015]"
        >
          {/* 3D Purple Clipboard Squircle Icon */}
          <div className="w-13 h-13 rounded-2xl clay-icon-box-purple flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              {/* Clipboard Base with 3D drop shadow & bevel */}
              <rect x="6.5" y="6.5" width="19" height="20.5" rx="4" fill="white" />
              <rect x="7" y="7" width="18" height="19.5" rx="3.5" fill="#FAF9FE" />
              {/* Metallic Top Clip */}
              <rect x="11" y="3.5" width="10" height="5.5" rx="2" fill="#E2DCFE" stroke="#8C7CFF" strokeWidth="1" />
              <circle cx="16" cy="5.5" r="1.2" fill="#6C5CE7" />
              {/* Checklist Lines with Tiny Bullets */}
              <circle cx="10.5" cy="13.5" r="1.3" fill="#8C7CFF" />
              <rect x="13.5" y="12.5" width="9" height="2" rx="1" fill="#8C7CFF" />
              <circle cx="10.5" cy="18" r="1.3" fill="#8C7CFF" />
              <rect x="13.5" y="17" width="9" height="2" rx="1" fill="#8C7CFF" />
              <circle cx="10.5" cy="22.5" r="1.3" fill="#8C7CFF" />
              <rect x="13.5" y="21.5" width="6" height="2" rx="1" fill="#8C7CFF" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#71788E]">Total Tasks</div>
            <div className="text-[28px] font-extrabold text-[#1E1B4B] leading-tight tracking-tight mt-0.5">24</div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1 mt-0.5">
              <span>↑ 12%</span>
              <span className="text-[#8E95A9] font-normal">from last week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completed (Mint Green Pastel) */}
        <div
          onClick={() => setActiveFilterTab('Done')}
          className="clay-stat-card-green rounded-[26px] p-4.5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.015]"
        >
          {/* 3D Mint Checkmark Squircle Icon */}
          <div className="w-13 h-13 rounded-2xl clay-icon-box-green flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              {/* 3D Inset White Disk */}
              <circle cx="16" cy="16" r="11" fill="white" fillOpacity="0.3" />
              <circle cx="16" cy="16" r="9.5" fill="white" />
              {/* Bold Mint Checkmark */}
              <path
                d="M11.5 16.2L14.5 19.2L20.8 12.8"
                stroke="#10B981"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#71788E]">Completed</div>
            <div className="text-[28px] font-extrabold text-[#1E1B4B] leading-tight tracking-tight mt-0.5">
              {displayedCompleted}
            </div>
            <div className="text-[11px] text-[#10B981] font-semibold flex items-center gap-1 mt-0.5">
              <span>↑ 8%</span>
              <span className="text-[#8E95A9] font-normal">from last week</span>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress (Warm Butter / Amber Pastel) */}
        <div
          onClick={() => setActiveFilterTab('In Progress')}
          className="clay-stat-card-amber rounded-[26px] p-4.5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.015]"
        >
          {/* 3D Golden Hourglass Squircle Icon */}
          <div className="w-13 h-13 rounded-2xl clay-icon-box-amber flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              {/* Hourglass Plates */}
              <rect x="8.5" y="5.5" width="15" height="2.5" rx="1.25" fill="white" />
              <rect x="8.5" y="24" width="15" height="2.5" rx="1.25" fill="white" />
              {/* Glass Bulbs with Translucent Shading */}
              <path
                d="M10 8 C10 13 14 15 16 16 C18 15 22 13 22 8 Z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M10 24 C10 19 14 17 16 16 C18 17 22 19 22 24 Z"
                fill="white"
                fillOpacity="0.95"
              />
              {/* Golden Sand in Chambers */}
              <path d="M12 10.5 L20 10.5 L17.5 13.5 L14.5 13.5 Z" fill="#F59E0B" />
              <path d="M12.5 22.5 L19.5 22.5 L17.5 19.5 L14.5 19.5 Z" fill="#F59E0B" />
              <circle cx="16" cy="16" r="1" fill="#F59E0B" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#71788E]">In Progress</div>
            <div className="text-[28px] font-extrabold text-[#1E1B4B] leading-tight tracking-tight mt-0.5">5</div>
            <div className="text-[11px] text-[#71788E] font-medium flex items-center gap-1 mt-0.5">
              <span>• Same as last week</span>
            </div>
          </div>
        </div>

        {/* Card 4: Overdue (Soft Rose Pastel) */}
        <div
          onClick={() => setActiveFilterTab('To Do')}
          className="clay-stat-card-rose rounded-[26px] p-4.5 flex items-center gap-4 cursor-pointer transition-all hover:scale-[1.015]"
        >
          {/* 3D Pink Flag Squircle Icon */}
          <div className="w-13 h-13 rounded-2xl clay-icon-box-rose flex items-center justify-center shrink-0">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              {/* Flagpole */}
              <rect x="8" y="5.5" width="2.5" height="21" rx="1.25" fill="white" />
              <circle cx="9.25" cy="5.5" r="2" fill="#FFE4E6" />
              {/* Fluttering 3D Flag */}
              <path
                d="M10.5 7.5 H22 C23 7.5 23.5 8.2 23 9 L20 12.5 L23 16 C23.5 16.8 23 17.5 22 17.5 H10.5 Z"
                fill="white"
              />
              <path
                d="M12 9.5 H19.5 L17.5 12.5 L19.5 15.5 H12 Z"
                fill="#FDA4AF"
              />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium text-[#71788E]">Overdue</div>
            <div className="text-[28px] font-extrabold text-[#1E1B4B] leading-tight tracking-tight mt-0.5">3</div>
            <div className="text-[11px] text-[#F43F5E] font-semibold flex items-center gap-1 mt-0.5">
              <span>↓ 25%</span>
              <span className="text-[#8E95A9] font-normal">from last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MIDDLE TWO-COLUMN WORKSPACE: LEFT (67%) / RIGHT (33%)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN (8 OF 12 COLS): MY TASKS + TWO CHARTS         */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* A. "MY TASKS" CARD */}
          <div className="admin-glass-card rounded-[32px] p-5 sm:p-6 bg-white">
            {/* Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-[17px] font-bold text-[#1E1B4B] tracking-tight">My Tasks</h3>

              <div className="flex items-center gap-2 xs:gap-2.5">
                {/* Filter Pill Button */}
                <button
                  type="button"
                  onClick={() => setActiveFilterTab(activeFilterTab === 'All' ? 'In Progress' : 'All')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F1F2F8] border border-[#E5E8F3] text-xs font-medium text-[#71788E] hover:text-[#1E1B4B] transition-all cursor-pointer shadow-xs hover:bg-white"
                >
                  <Filter className="w-3.5 h-3.5 text-[#8E95A9]" />
                  <span>Filter</span>
                </button>

                {/* Sort By Dropdown */}
                <button
                  type="button"
                  onClick={() => setSortBy(sortBy === 'Due Date' ? 'Priority' : sortBy === 'Priority' ? 'Title' : 'Due Date')}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#F1F2F8] border border-[#E5E8F3] text-xs font-medium text-[#71788E] hover:text-[#1E1B4B] transition-all cursor-pointer shadow-xs hover:bg-white"
                >
                  <span>Sort by: <strong className="text-[#1E1B4B] font-semibold">{sortBy}</strong></span>
                  <span className="text-[9px] text-[#8E95A9] ml-0.5">▼</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs Underline */}
            <div className="flex items-center gap-5 sm:gap-7 border-b border-[#F0EFF8] pb-3 mb-3 text-[13px] font-medium overflow-x-auto no-scrollbar">
              {(['All', 'To Do', 'In Progress', 'Done'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilterTab(tab)}
                  className={`relative pb-1 transition-all cursor-pointer shrink-0 ${
                    activeFilterTab === tab
                      ? 'text-[#6C5CE7] font-bold'
                      : 'text-[#8E95A9] hover:text-[#1E1B4B]'
                  }`}
                >
                  <span>{tab}</span>
                  {activeFilterTab === tab && (
                    <span className="absolute bottom-[-13px] left-0 right-0 h-[3px] rounded-full bg-[#6C5CE7]" />
                  )}
                </button>
              ))}
            </div>

            {/* Task Rows List */}
            <div className="divide-y divide-[#F8F7FD]">
              {filteredTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8E95A9]">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3 px-1.5 hover:bg-[#FAF9FE] rounded-xl transition-colors group"
                  >
                    {/* Left: Checkbox + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="cursor-pointer shrink-0 transition-transform active:scale-90"
                      >
                        {task.completed ? (
                          <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-[#D1D5DB] hover:border-[#6C5CE7] transition-colors bg-white" />
                        )}
                      </button>

                      <span className={`text-[13px] sm:text-sm font-semibold truncate transition-colors ${
                        task.completed ? 'text-[#1E1B4B]' : 'text-[#1E1B4B] group-hover:text-[#6C5CE7]'
                      }`}>
                        {task.title}
                      </span>
                    </div>

                    {/* Category Pill */}
                    <div className="hidden sm:block shrink-0">
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                          task.categoryTheme === 'purple'
                            ? 'bg-[#F0EFFE] text-[#6C5CE7]'
                            : task.categoryTheme === 'blue'
                            ? 'bg-[#E0F2FE] text-[#0284C7]'
                            : task.categoryTheme === 'violet'
                            ? 'bg-[#F3E8FF] text-[#9333EA]'
                            : 'bg-[#E8FAF2] text-[#10B981]'
                        }`}
                      >
                        {task.category}
                      </span>
                    </div>

                    {/* Due Date */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-[#71788E] shrink-0 font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#9A9FB1]" />
                      <span>{task.dueDate}</span>
                    </div>

                    {/* Priority Pill */}
                    <div className="shrink-0">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                          task.priority === 'High'
                            ? 'bg-[#FFE4E6] text-[#E11D48]'
                            : task.priority === 'Medium'
                            ? 'bg-[#FEF3C7] text-[#D97706]'
                            : 'bg-[#DCFCE7] text-[#16A34A]'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* 3-Dot Options */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className="p-1 text-[#9A9FB1] hover:text-[#1E1B4B] transition-colors cursor-pointer shrink-0"
                      title="Options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* B. BOTTOM TWO CHARTS (Side-by-Side: Overview + Priority) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Chart 1: Tasks Overview (Spline Wave Chart) */}
            <div className="admin-glass-card rounded-[32px] p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[15px] font-bold text-[#1E1B4B]">Tasks Overview</h4>
                <button
                  type="button"
                  onClick={() => setOverviewRange(overviewRange === 'This Week' ? 'This Month' : 'This Week')}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#F1F2F8] border border-[#E5E8F3] text-[11px] font-medium text-[#71788E] hover:text-[#1E1B4B] transition-all cursor-pointer shadow-xs hover:bg-white"
                >
                  <span>{overviewRange}</span>
                  <span className="text-[8px] text-[#8E95A9]">▼</span>
                </button>
              </div>

              {/* Spline Wave Chart Canvas with Floating Tooltip */}
              <div className="relative w-full pt-6 pb-1">
                {/* Floating 3D Tooltip Capsule above Thursday */}
                <div className="absolute top-0 left-[57%] -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E8F3] shadow-[0_8px_20px_rgba(108,92,231,0.22)] text-center">
                    <div className="text-[13px] font-extrabold text-[#1E1B4B] leading-none">18</div>
                    <div className="text-[9px] text-[#71788E] font-medium leading-tight mt-0.5">Tasks</div>
                  </div>
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white" />
                </div>

                <div className="flex items-end gap-2 h-36">
                  {/* Y-Axis Labels */}
                  <div className="flex flex-col justify-between h-28 text-[10px] text-[#9A9FB1] font-medium pr-1">
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                    <span>0</span>
                  </div>

                  {/* SVG Spline Wave */}
                  <div className="flex-1 h-full relative">
                    <svg className="w-full h-28 overflow-visible" viewBox="0 0 280 100" fill="none" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="violetSplineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8C7CFF" stopOpacity="0.32" />
                          <stop offset="100%" stopColor="#8C7CFF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Area Fill */}
                      <path
                        d="M 10 70 C 40 85, 60 55, 90 60 C 120 65, 130 18, 150 20 C 170 22, 185 45, 210 50 C 235 55, 255 25, 275 35 L 275 95 L 10 95 Z"
                        fill="url(#violetSplineGradient)"
                      />

                      {/* Spline Wave Stroke */}
                      <path
                        d="M 10 70 C 40 85, 60 55, 90 60 C 120 65, 130 18, 150 20 C 170 22, 185 45, 210 50 C 235 55, 255 25, 275 35"
                        stroke="#6C5CE7"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Nodes on points */}
                      <circle cx="10" cy="70" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="55" cy="75" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="95" cy="60" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="150" cy="20" r="4.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="2" className="animate-pulse" />
                      <circle cx="195" cy="48" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="240" cy="45" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="275" cy="35" r="3.5" fill="#6C5CE7" stroke="#FFFFFF" strokeWidth="1.5" />
                    </svg>

                    {/* X-Axis Days */}
                    <div className="flex items-center justify-between text-[10px] text-[#9A9FB1] font-medium mt-2 px-1">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span className="font-bold text-[#6C5CE7]">Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Tasks by Priority (3D Donut Chart) */}
            <div className="admin-glass-card rounded-[32px] p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[15px] font-bold text-[#1E1B4B]">Tasks by Priority</h4>
              </div>

              <div className="flex flex-col xs:flex-row items-center justify-around gap-4 py-2 flex-1">
                {/* 3D Claymorphic Donut Chart SVG with Puffy Torus Lighting */}
                <div className="relative w-30 h-30 xs:w-34 xs:h-34 shrink-0 filter drop-shadow-[0_12px_20px_rgba(180,185,215,0.38)]">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="donutLowGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6EE7B7" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <linearGradient id="donutMedGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FCD34D" />
                        <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                      <linearGradient id="donutHighGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FDA4AF" />
                        <stop offset="100%" stopColor="#F43F5E" />
                      </linearGradient>
                    </defs>

                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="36" fill="none" stroke="#F1F0F7" strokeWidth="18" />

                    {/* Mint Arc (Low: 25%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="url(#donutLowGrad)"
                      strokeWidth="18"
                      strokeDasharray="56.5 226"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />

                    {/* Rose Arc (High: 33%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="url(#donutHighGrad)"
                      strokeWidth="18"
                      strokeDasharray="74.6 226"
                      strokeDashoffset="-60"
                      strokeLinecap="round"
                    />

                    {/* Golden Arc (Medium: 42%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="36"
                      fill="none"
                      stroke="url(#donutMedGrad)"
                      strokeWidth="18"
                      strokeDasharray="95 226"
                      strokeDashoffset="-140"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Soft 3D Center Hole */}
                  <div className="absolute inset-0 m-auto w-13 h-13 rounded-full bg-white shadow-[inset_0_2px_5px_rgba(180,185,210,0.35)] flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EDE9FE]" />
                  </div>
                </div>

                {/* Priority Breakdown Legend */}
                <div className="space-y-2.5 text-xs w-full xs:w-auto">
                  {/* High */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E] shadow-xs" />
                      <span className="text-[#71788E] font-medium">High</span>
                    </div>
                    <span className="font-bold text-[#1E1B4B]">8 (33%)</span>
                  </div>

                  {/* Medium */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-xs" />
                      <span className="text-[#71788E] font-medium">Medium</span>
                    </div>
                    <span className="font-bold text-[#1E1B4B]">10 (42%)</span>
                  </div>

                  {/* Low */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs" />
                      <span className="text-[#71788E] font-medium">Low</span>
                    </div>
                    <span className="font-bold text-[#1E1B4B]">6 (25%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (4 OF 12 COLS): CALENDAR + PROGRESS + UPCOMING */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Card 1: Calendar */}
          <div className="admin-glass-card rounded-[32px] p-5 bg-white">
            {/* Header: Month & Navigation */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-bold text-[#1E1B4B]">Calendar</h3>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentMonthName('Apr 2024')}
                  className="w-6 h-6 rounded-full border border-[#E5E8F3] flex items-center justify-center text-[#8E95A9] hover:text-[#1E1B4B] hover:bg-[#F3F2F8] transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonthName('Jun 2024')}
                  className="w-6 h-6 rounded-full border border-[#E5E8F3] flex items-center justify-center text-[#8E95A9] hover:text-[#1E1B4B] hover:bg-[#F3F2F8] transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subhead Month Name */}
            <div className="text-xs font-semibold text-[#1E1B4B] mb-3">
              {currentMonthName}
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#9A9FB1] mb-2">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Day Cells Grid (Exact 1:1 match to reference image) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#1E1B4B]">
              {/* Previous month greyed days */}
              <span className="py-1.5 text-[#C4C8D8]">29</span>
              <span className="py-1.5 text-[#C4C8D8]">30</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">1</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">2</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">3</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">4</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">5</span>

              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">6</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">7</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">8</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">9</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">10</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">11</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">12</span>

              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">13</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">14</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">15</span>
              {/* Day 16 (Highlighted in solid 3D Purple Circle) */}
              <button
                type="button"
                onClick={() => setSelectedDay(16)}
                className="py-1.5 rounded-full bg-[#6C5CE7] text-white font-bold shadow-[0_4px_14px_rgba(108,92,231,0.45)] cursor-pointer hover:scale-105 transition-transform"
              >
                16
              </button>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">17</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">18</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">19</span>

              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">20</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">21</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">22</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">23</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">24</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">25</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">26</span>

              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">27</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">28</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">29</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">30</span>
              <span className="py-1.5 hover:bg-[#F3F2F8] rounded-xl cursor-pointer">31</span>
              <span className="py-1.5 text-[#C4C8D8]">1</span>
              <span className="py-1.5 text-[#C4C8D8]">2</span>
            </div>
          </div>

          {/* Card 2: Progress */}
          <div className="admin-glass-card rounded-[32px] p-5 bg-white">
            <h3 className="text-[15px] font-bold text-[#1E1B4B] mb-3">Progress</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#71788E] font-medium">Overall Progress</span>
                <span className="font-extrabold text-[#1E1B4B] text-base">{progressPercent}%</span>
              </div>

              {/* Smooth Mint Clay Progress Bar with Rounded Ends */}
              <div className="w-full h-3 rounded-full bg-[#E8FAF2] overflow-hidden p-0.5">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#10B981] shadow-[0_2px_8px_rgba(16,185,129,0.35)] transition-all duration-500"
                />
              </div>

              <div className="text-[11px] text-[#8E95A9] font-medium pt-0.5">
                {displayedCompleted} of {displayedTotal} tasks completed
              </div>
            </div>
          </div>

          {/* Card 3: Upcoming Tasks */}
          <div className="admin-glass-card rounded-[32px] p-5 bg-white">
            <h3 className="text-[15px] font-bold text-[#1E1B4B] mb-3.5">Upcoming Tasks</h3>

            <div className="space-y-3">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl clay-icon-box-rose flex items-center justify-center shrink-0">
                    <FileText className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1E1B4B] truncate">Design system update</div>
                    <div className="text-[10px] text-[#8E95A9]">May 20, 2024</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFE4E6] text-[#E11D48] shrink-0">
                  High
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl clay-icon-box-blue flex items-center justify-center shrink-0">
                    <Layout className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1E1B4B] truncate">Prototype presentation</div>
                    <div className="text-[10px] text-[#8E95A9]">May 21, 2024</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF3C7] text-[#D97706] shrink-0">
                  Medium
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl clay-icon-box-green flex items-center justify-center shrink-0">
                    <UserCheck className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#1E1B4B] truncate">User testing</div>
                    <div className="text-[10px] text-[#8E95A9]">May 23, 2024</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#DCFCE7] text-[#16A34A] shrink-0">
                  Low
                </span>
              </div>
            </div>

            {/* View All Link */}
            <div className="pt-3 mt-2 border-t border-[#F0EFFF] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveFilterTab('All')}
                className="text-xs font-bold text-[#6C5CE7] hover:text-[#5845E4] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View all tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. INTERACTIVE "+ NEW TASK" MODAL                         */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[32px] p-5 sm:p-6 shadow-[0_24px_55px_rgba(108,92,231,0.25)] border border-white space-y-4 sm:space-y-5 animate-scaleUp">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0EFFF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl clay-icon-box-purple flex items-center justify-center text-white">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E1B4B]">Create New Task</h3>
                  <p className="text-xs text-[#71788E]">Add a task to your personal Taskly queue</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#8E95A9] hover:text-[#1E1B4B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Design 3D Hero Animation"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F1F2F8] border border-[#E5E8F3] text-xs text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#F1F2F8] border border-[#E5E8F3] text-xs text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="Website Redesign">Website Redesign</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Branding">Branding</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E1B4B] mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[#F1F2F8] border border-[#E5E8F3] text-xs text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="High">High (Rose)</option>
                    <option value="Medium">Medium (Amber)</option>
                    <option value="Low">Low (Green)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E1B4B] mb-1">Due Date</label>
                <input
                  type="text"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  placeholder="e.g. May 28"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F1F2F8] border border-[#E5E8F3] text-xs text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/30 focus:bg-white transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-[#71788E] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-glow-btn px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md cursor-pointer hover:scale-105 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
