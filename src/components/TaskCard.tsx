
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Edit, RotateCcw } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Task = Tables<"task"> & {
  casa: Tables<"casa"> | null;
  mezzi: Tables<"mezzi"> | null;
};

interface TaskCardProps {
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

const TaskCard = ({ 
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
}: TaskCardProps) => {
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
    return { name: '', address: '' };
  };

  const locationInfo = getLocationInfo();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {locationInfo.name}
            {locationInfo.address && (
              <span className="block text-sm text-gray-500 font-normal mt-1">
                {locationInfo.address}
              </span>
            )}
          </CardTitle>
          <Badge variant={getPriorityVariant(task.priorita || '')}>
            {task.priorita?.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600">{task.descrizione}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-500">Rilevato da:</span>
            <p>{task.rilevato_da}</p>
          </div>
          {task.operatore && (
            <div>
              <span className="font-medium text-gray-500">Operatore:</span>
              <p>{task.operatore}</p>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-500">Data creazione:</span>
            <p>{formatDate(task.data_creazione)}</p>
          </div>
          {task.data_completamento && (
            <div>
              <span className="font-medium text-gray-500">Data completamento:</span>
              <p className="text-green-600">{formatDate(task.data_completamento)}</p>
            </div>
          )}
          {task.costo_manutenzione && (
            <div className="col-span-2">
              <span className="font-medium text-gray-500">Costo:</span>
              <p className="text-green-600 font-semibold">€{task.costo_manutenzione} (IVA inclusa)</p>
            </div>
          )}
        </div>

        {/* Upload immagini se abilitato */}
        {showImageUpload && onImageUploaded && (
          <div className="pt-2">
            <ImageUpload 
              taskId={task.id}
              onImageUploaded={onImageUploaded}
            />
          </div>
        )}

        {/* Immagini se presenti */}
        {children && (
          <div className="pt-2">
            {React.cloneElement(children as React.ReactElement, { refresh })}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {showCompleteButton && onComplete && (
            <Button 
              onClick={() => onComplete(task.id)}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completa Task
            </Button>
          )}
          {showEditButton && onEdit && (
            <Button 
              onClick={() => onEdit(task)}
              variant="outline"
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          )}
          {showRestoreButton && onRestore && (
            <Button
              variant="outline"
              onClick={() => onRestore(task.id)}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Ripristina
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
