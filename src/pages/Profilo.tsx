
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

const Profilo = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Create profile if doesn't exist
        const newProfile = {
          id: user.user.id,
          email: user.user.email,
          nome: '',
          cognome: '',
          avatar_url: null,
          ruolo: 'user'
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);
          
        if (insertError) throw insertError;
        setProfile(newProfile as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Errore nel caricamento del profilo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: profile.nome,
          cognome: profile.cognome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success("Profilo aggiornato con successo!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Errore nell'aggiornamento del profilo");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: data.publicUrl });
      toast.success("Avatar aggiornato con successo!");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error("Errore nel caricamento dell'avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  const getInitials = () => {
    const nome = profile.nome || '';
    const cognome = profile.cognome || '';
    return `${nome.charAt(0)}${cognome.charAt(0)}`.toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Il Mio Profilo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-8 w-8 p-0"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {profile.nome && profile.cognome 
                    ? `${profile.nome} ${profile.cognome}` 
                    : profile.email}
                </h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
                <p className="text-xs text-gray-400 capitalize">{profile.ruolo}</p>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={profile.nome || ''}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  placeholder="Il tuo nome"
                />
              </div>

              <div>
                <Label htmlFor="cognome">Cognome</Label>
                <Input
                  id="cognome"
                  value={profile.cognome || ''}
                  onChange={(e) => setProfile({ ...profile, cognome: e.target.value })}
                  placeholder="Il tuo cognome"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L'email non può essere modificata
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profilo;
