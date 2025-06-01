
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface TaskImagesProps {
  taskId: string;
  refresh?: number;
}

type TaskImage = Tables<"task_images">;

export const TaskImages = ({ taskId, refresh }: TaskImagesProps) => {
  const [images, setImages] = useState<TaskImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [taskId, refresh]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('task_images')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string, storagePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('task-images')
        .remove([storagePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('task_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast.success("Immagine eliminata");
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error("Errore nell'eliminazione dell'immagine");
    }
  };

  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('task-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  if (loading) return <div className="text-sm text-gray-500">Caricamento immagini...</div>;

  if (images.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <ImageIcon className="h-4 w-4" />
        Nessuna immagine caricata
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Immagini allegate:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={getImageUrl(image.storage_path)}
              alt={image.file_name}
              className="w-full h-20 object-cover rounded border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteImage(image.id, image.storage_path)}
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="text-xs text-gray-500 mt-1 truncate">
              {image.file_name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
