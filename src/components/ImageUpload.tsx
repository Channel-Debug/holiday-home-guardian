
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, X, Image } from "lucide-react";

interface ImageUploadProps {
  taskId: string;
  onImageUploaded: () => void;
}

export const ImageUpload = ({ taskId, onImageUploaded }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${taskId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('task_images')
        .insert({
          task_id: taskId,
          storage_path: fileName,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.user.id,
        });

      if (dbError) throw dbError;

      toast.success("Immagine caricata con successo!");
      onImageUploaded();
      
      // Reset input
      event.target.value = "";
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Errore nel caricamento dell'immagine");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id={`file-upload-${taskId}`}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => document.getElementById(`file-upload-${taskId}`)?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? "Caricamento..." : "Carica Immagine"}
      </Button>
    </div>
  );
};
