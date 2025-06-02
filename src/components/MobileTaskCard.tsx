import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Edit, RotateCcw } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
};

interface MobileTaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onRestore?: (taskId: string) => void;
  showCompleteButton?: boolean;
  showEditButton?: boolean;
  showRestoreButton?: boolean;
  children?: React.ReactNode;
  refresh?: number;
}

const MobileTaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onRestore,
  showCompleteButton = false,
  showEditButton = false,
  showRestoreButton = false,
  children,
  refresh
}: MobileTaskCardProps) => {
  const getPriorityVariant = (priority: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'destructive';
      case 'media':
        return 'secondary';
      case 'bassa':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 border-red-500';
      case 'media':
        return 'bg-yellow-100 border-yellow-500';
      case 'bassa':
        return 'bg-green-100 border-green-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  const getPriorityTextColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'text-red-700';
      case 'media':
        return 'text-yellow-700';
      case 'bassa':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`${getPriorityColor(task.priorita || '')} border-l-4`}>
      <CardContent className="p-4">
        {/* Header con priorità e casa */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityVariant(task.priorita || '')} className={`${getPriorityColor(task.priorita || '')} ${getPriorityTextColor(task.priorita || '')} text-xs font-medium`}>
              {task.priorita?.toUpperCase()}
            </Badge>
          </div>
          <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
            {task.casa?.nome}
          </span>
        </div>

        {/* Descrizione */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.descrizione}
        </p>

        {/* Info compatte su singola riga */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex justify-between">
            <span>Da: {task.rilevato_da}</span>
            <span>Creata: {formatDate(task.data_creazione)}</span>
          </div>
          {task.operatore && (
            <div className="truncate">
              <span className="font-medium">Op:</span> {task.operatore}
            </div>
          )}
          {task.data_completamento && (
            <div className="text-green-600">
              <span className="font-medium">Completata:</span> {formatDate(task.data_completamento)}
            </div>
          )}
          {task.costo_manutenzione && (
            <div className="text-green-600 font-medium">
              €{task.costo_manutenzione}
            </div>
          )}
        </div>

        {/* Immagini se presenti */}
        {children && (
          <div className="mb-3">
            {React.cloneElement(children as React.ReactElement, { refresh })}
          </div>
        )}

        {/* Bottoni azione */}
        <div className="flex gap-2">
          {showCompleteButton && onComplete && (
            <Button 
              onClick={() => onComplete(task.id)}
              size="sm"
              className="flex-1 h-8"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completa
            </Button>
          )}
          {showEditButton && onEdit && (
            <Button 
              onClick={() => onEdit(task)}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {showRestoreButton && onRestore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(task.id)}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTaskCard;
