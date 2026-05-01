import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const ImageUpload = ({
  bucket,
  pathPrefix,
  value,
  onChange,
  label = "Capa",
}: {
  bucket: "post-imagens" | "avatars" | "materiais";
  pathPrefix: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [up, setUp] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Máximo 5MB");
    setUp(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Imagem enviada!");
    } catch (e: any) { toast.error(e.message); }
    finally { setUp(false); }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">{label}</label>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="" className="h-32 w-auto rounded border-2 border-pixelyellow/40 object-cover" />
          <button onClick={() => onChange("")} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-pixelyellow/30 rounded-lg p-6 text-center cursor-pointer hover:border-pixelyellow/60 transition-colors" onClick={() => ref.current?.click()}>
          <ImageIcon className="w-8 h-8 mx-auto opacity-60 mb-2" />
          <p className="text-xs text-muted-foreground">{up ? "Enviando..." : "Clique para enviar (máx 5MB)"}</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => ref.current?.click()} disabled={up}>
          <Upload className="w-3.5 h-3.5 mr-1" /> {value ? "Trocar" : "Enviar"}
        </Button>
        <Input value={value} onChange={e => onChange(e.target.value)} placeholder="ou cole uma URL" className="flex-1 text-xs" />
      </div>
    </div>
  );
};
