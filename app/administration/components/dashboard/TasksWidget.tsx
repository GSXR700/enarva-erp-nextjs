// app/administration/components/dashboard/TasksWidget.tsx
import Link from "next/link";
import { ArrowRight, CheckSquare, Clock, User } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: Date | null;
  assignedTo?: { name: string | null } | null;
}

interface TasksWidgetProps {
  tasks: Task[];
  viewAllLink: string;
}

export function TasksWidget({ tasks, viewAllLink }: TasksWidgetProps) {
  const getPriorityBadge = (priority: string) => {
    const base = "px-2 py-0.5 text-xs font-medium rounded-full";
    switch (priority) {
      case 'HIGH': 
        return <span className={`${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`}>Urgent</span>;
      case 'MEDIUM': 
        return <span className={`${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`}>Normal</span>;
      case 'LOW': 
        return <span className={`${base} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`}>Faible</span>;
      default: 
        return null;
    }
  };

  const getTimeRemaining = (dueDate: Date | null | undefined) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMs < 0) return <span className="text-red-600">En retard</span>;
    if (diffHours < 24) return <span className="text-orange-600">{diffHours}h restantes</span>;
    return <span className="text-gray-600">{diffDays}j restants</span>;
  };

  return (
    <div className="bg-white dark:bg-dark-container p-4 sm:p-6 rounded-2xl shadow-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="text-blue-600 dark:text-blue-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tâches en Cours</h3>
        </div>
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          Voir tout <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex-grow overflow-y-auto">
        {tasks.length > 0 ? (
          <ul className="space-y-3">
            {tasks.map(task => (
              <li key={task.id}>
                <Link href={`${viewAllLink}/${task.id}`} className="block p-3 bg-gray-50 dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-highlight-bg transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 dark:text-dark-text truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-dark-subtle mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {task.assignedTo && (
                          <div className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-dark-subtle">
                              {task.assignedTo.name}
                            </span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs">
                              {getTimeRemaining(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-2">
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 dark:text-dark-subtle py-8">
            <CheckSquare className="mb-2" size={32} />
            <p>Aucune tâche en cours</p>
          </div>
        )}
      </div>
    </div>
  );
}