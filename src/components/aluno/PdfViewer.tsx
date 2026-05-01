import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

export const PdfViewer = ({
  open,
  onOpenChange,
  url,
  titulo,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  url: string | null;
  titulo: string;
}) => {
  if (!url) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 flex flex-col bg-[hsl(220_70%_8%)] border-pixelyellow/40">
        <DialogHeader className="p-4 border-b border-pixelyellow/30 flex flex-row items-center justify-between gap-3 space-y-0">
          <DialogTitle className="font-display text-pixelyellow uppercase truncate">{titulo}</DialogTitle>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <a href={url} target="_blank" rel="noopener"><ExternalLink className="w-3.5 h-3.5 mr-1" />Abrir</a>
            </Button>
            <Button asChild size="sm" className="bg-pixelyellow text-navy hover:bg-pixelyellow/90">
              <a href={url} download><Download className="w-3.5 h-3.5 mr-1" />Baixar</a>
            </Button>
          </div>
        </DialogHeader>
        <iframe src={`${url}#toolbar=1&view=FitH`} className="flex-1 w-full bg-white" title={titulo} />
      </DialogContent>
    </Dialog>
  );
};
