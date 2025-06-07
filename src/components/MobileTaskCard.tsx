
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Edit, RotateCcw, Archive } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
  mezzi: Tables<"mezzi"> | null;
};

interface MobileTaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onArchive?: (taskId: string) => void;
  onRestore?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  showCompleteButton?: boolean;
  showArchiveButton?: boolean;
  showRestoreButton?: boolean;
  showEditButton?: boolean;
  showImageUpload?: boolean;
  onImageUploaded?: () => void;
  refresh?: number;
  children?: React.ReactNode;
}

const MobileTaskCard = ({ 
  task, 
  onComplete, 
  onArchive,
  onRestore, 
  onEdit, 
  showCompleteButton = false,
  showArchiveButton = false,
  showRestoreButton = false,
  showEditButton = false,
  showImageUpload = false,
  onImageUploaded,
  refresh,
  children 
}: MobileTaskCardProps) => {
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'bassa': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityText = (priority: string | null) => {
    switch (priority) {
      case 'alta': return '🔴 Alta';
      case 'media': return '🟡 Media';
      case 'bassa': return '🟢 Bassa';
      default: return 'Non specificata';
    }
  };

  const getPriorityBackground = (priority: string | null) => {
    switch (priority) {
      case 'alta': return 'bg-red-500/35 text-black';
      case 'media': return 'bg-yellow-500/35 text-black';
      case 'bassa': return 'bg-green-500/35';
      default: return '';
    }
  };

  const getTaskTextColor = (priority: string | null) => {
    switch (priority) {
      case 'alta': return 'text-black';
      case 'media': return 'text-black';
      default: return '';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Non specificato';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non specificato';
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const taskTextColor = getTaskTextColor(task.priorita);

  return (
    <Card className={`w-full ${taskTextColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
            {task.descrizione || 'Descrizione non disponibile'}
          </CardTitle>
          <Badge 
            variant={getPriorityColor(task.priorita)} 
            className={`text-xs flex-shrink-0 ${getPriorityBackground(task.priorita)}`}
          >
            {getPriorityText(task.priorita)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div>
          <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>
            {task.tipo_manutenzione === 'casa' ? 'Casa:' : 'Mezzo:'}
          </span>
          <p className="text-sm">
            {task.casa?.nome || task.mezzi?.nome || 'Non specificato'}
          </p>
          {task.casa?.indirizzo && (
            <p className={`text-xs ${taskTextColor || 'text-gray-500'}`}>{task.casa.indirizzo}</p>
          )}
        </div>

        {task.rilevato_da && (
          <div>
            <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Rilevato da:</span>
            <p className="text-sm">{task.rilevato_da}</p>
          </div>
        )}

        {task.operatore && (
          <div>
            <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Operatore:</span>
            <p className="text-sm">{task.operatore}</p>
          </div>
        )}

        {task.costo_manutenzione && (
          <div>
            <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Costo (IVA 22% inclusa):</span>
            <p className="text-sm font-medium">{formatCurrency(task.costo_manutenzione)}</p>
          </div>
        )}

        {task.note && (
          <div>
            <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Note:</span>
            <p className="text-sm">{task.note}</p>
          </div>
        )}

        <div>
          <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Creata:</span>
          <p className={`text-xs ${taskTextColor || 'text-gray-500'}`}>{formatDate(task.data_creazione)}</p>
        </div>

        {task.data_completamento && (
          <div>
            <span className={`font-medium text-xs ${taskTextColor || 'text-gray-600'}`}>Completata:</span>
            <p className={`text-xs ${taskTextColor || 'text-gray-500'}`}>{formatDate(task.data_completamento)}</p>
          </div>
        )}

        {children}

        {showImageUpload && onImageUploaded && (
          <div className="pt-2">
            <ImageUpload 
              taskId={task.id}
              onImageUploaded={onImageUploaded}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex gap-2">
            {showCompleteButton && onComplete && (
              <Button
                onClick={() => onComplete(task.id)}
                className="flex-1"
                size="sm"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Completa
              </Button>
            )}
            
            {showArchiveButton && onArchive && (
              <Button
                onClick={() => onArchive(task.id)}
                variant="secondary"
                className="flex-1"
                size="sm"
              >
                <Archive className="h-3 w-3 mr-1" />
                Archivia
              </Button>
            )}

            {showRestoreButton && onRestore && (
              <Button
                onClick={() => onRestore(task.id)}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Ripristina
              </Button>
            )}
          </div>

          {showEditButton && onEdit && (
            <Button
              onClick={() => onEdit(task)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Edit className="h-3 w-3 mr-1" />
              Modifica
            </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileTaskCard;
