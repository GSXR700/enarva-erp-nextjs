// app/administration/components/dashboard/TeamOverview.tsx
import Link from "next/link";
import { ArrowRight, Users, MapPin, CheckCircle, Clock } from "lucide-react";

interface TeamMember {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  status: string;
  image?: string | null;
  missions?: any[];
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastSeen?: Date | null;
}

interface TeamOverviewProps {
  teamMembers: TeamMember[];
  viewAllLink: string;
}

export function TeamOverview({ teamMembers, viewAllLink }: TeamOverviewProps) {
  const getStatusIndicator = (member: TeamMember) => {
    const hasActiveMission = member.missions && member.missions.length > 0;
    const isOnline = member.lastSeen && 
      new Date().getTime() - new Date(member.lastSeen).getTime() < 5 * 60 * 1000; // 5 minutes

    if (hasActiveMission) {
      return <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <CheckCircle size={12} /> En mission
      </span>;
    }
    if (isOnline) {
      return <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
        <Clock size={12} /> Disponible
      </span>;
    }
    return <span className="text-xs text-gray-500 dark:text-dark-subtle">Hors ligne</span>;
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white dark:bg-dark-container p-4 sm:p-6 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Équipe Active</h3>
        </div>
        <Link href={viewAllLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          Gérer l'équipe <ArrowRight size={14} />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.slice(0, 6).map(member => (
          <Link 
            key={member.id} 
            href={`${viewAllLink}/${member.id}`}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-surface rounded-lg hover:bg-gray-100 dark:hover:bg-dark-highlight-bg transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.name || ''} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {getInitials(member.name)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-dark-text truncate">
                {member.name || 'Sans nom'}
              </p>
              {getStatusIndicator(member)}
            </div>

            {/* Location indicator */}
            {member.currentLatitude && member.currentLongitude && (
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>

      {teamMembers.length > 6 && (
        <div className="mt-4 text-center">
          <Link 
            href={viewAllLink} 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Voir tous les {teamMembers.length} membres →
          </Link>
        </div>
      )}
    </div>
  );
}