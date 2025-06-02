
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
}

const MobileTaskCard = ({ 
  task, 
  onComplete, 
  onEdit, 
  onRestore,
  showCompleteButton = false,
  showEditButton = false,
  showRestoreButton = false,
  children 
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'bg-red-50 border-red-200';
      case 'media':
        return 'bg-yellow-50 border-yellow-200';
      case 'bassa':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className={`${getPriorityColor(task.priorita || '')} border-l-4`}>
      <CardContent className="p-4">
        {/* Header con priorità e casa */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityVariant(task.priorita || '')} className="text-xs">
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
            <span>{formatDate(task.data_creazione)}</span>
          </div>
          {task.operatore && (
            <div className="truncate">
              <span className="font-medium">Op:</span> {task.operatore}
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
            {children}
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
