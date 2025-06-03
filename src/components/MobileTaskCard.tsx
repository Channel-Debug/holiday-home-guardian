
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Edit, RotateCcw } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
  mezzi: Tables<"mezzi"> | null;
};

interface MobileTaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onRestore?: (taskId: string) => void;
  showCompleteButton?: boolean;
  showEditButton?: boolean;
  showRestoreButton?: boolean;
  showImageUpload?: boolean;
  onImageUploaded?: () => void;
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
  showImageUpload = false,
  onImageUploaded,
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
        return 'bg-red-50 border-red-500';
      case 'media':
        return 'bg-yellow-50 border-yellow-500';
      case 'bassa':
        return 'bg-green-50 border-green-500';
      default:
        return 'bg-gray-50 border-gray-300';
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

  const getLocationInfo = () => {
    if (task.tipo_manutenzione === 'mezzo' && task.mezzi) {
      return {
        name: task.mezzi.nome,
        address: task.mezzi.tipo || ''
      };
    } else if (task.casa) {
      return {
        name: task.casa.nome,
        address: task.casa.indirizzo || ''
      };
    }
    return { name: 'N/A', address: '' };
  };

  const locationInfo = getLocationInfo();

  return (
    <Card className={`${getPriorityColor(task.priorita || '')} border-l-4 shadow-sm`}>
      <CardContent className="p-3">
        {/* Header compatto */}
        <div className="flex items-start justify-between mb-2">
          <Badge 
            variant={getPriorityVariant(task.priorita || '')} 
            className="text-xs px-2 py-1 h-6"
          >
            {task.priorita?.toUpperCase() || 'N/A'}
          </Badge>
          <div className="text-right flex-1 ml-2 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {locationInfo.name}
            </div>
            {locationInfo.address && (
              <div className="text-xs text-gray-500 truncate">
                {locationInfo.address}
              </div>
            )}
          </div>
        </div>

        {/* Descrizione */}
        <div className="mb-2">
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {task.descrizione || 'Nessuna descrizione'}
          </p>
        </div>

        {/* Informazioni compatte */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Da:</span>
            <span className="truncate ml-1">{task.rilevato_da || 'N/A'}</span>
          </div>
          
          {task.operatore && (
            <div className="flex justify-between items-center">
              <span className="font-medium">Op:</span>
              <span className="truncate ml-1">{task.operatore}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Creata:</span>
            <span className="text-xs">{formatDate(task.data_creazione)}</span>
          </div>
          
          {task.data_completamento && (
            <div className="flex justify-between items-center text-green-600">
              <span className="font-medium">Completata:</span>
              <span className="text-xs">{formatDate(task.data_completamento)}</span>
            </div>
          )}
          
          {task.costo_manutenzione && (
            <div className="flex justify-between items-center text-green-600 font-medium">
              <span>Costo:</span>
              <span>€{Number(task.costo_manutenzione).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Upload immagini */}
        {showImageUpload && onImageUploaded && (
          <div className="mb-3">
            <ImageUpload 
              taskId={task.id}
              onImageUploaded={onImageUploaded}
            />
          </div>
        )}

        {/* Immagini */}
        {children && (
          <div className="mb-3">
            {React.cloneElement(children as React.ReactElement, { refresh })}
          </div>
        )}

        {/* Bottoni azione */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {showCompleteButton && onComplete && (
            <Button 
              onClick={() => onComplete(task.id)}
              size="sm"
              className="flex-1 h-8 text-xs"
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
              className="h-8 px-3"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          {showRestoreButton && onRestore && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestore(task.id)}
              className="h-8 px-3"
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
