import { AdminLayout } from "@/components/admin/AdminLayout";
import { Construction } from "lucide-react";

interface Props { title: string; }

const AdminPlaceholder = ({ title }: Props) => (
  <AdminLayout>
    <h1 className="font-display text-4xl uppercase text-navy">{title}</h1>
    <div className="mt-8 pixel-card text-center">
      <Construction className="w-12 h-12 text-pixelyellow mx-auto mb-3" />
      <h2 className="font-display text-2xl uppercase text-navy mb-2">Em construção</h2>
      <p className="font-body text-muted-foreground">
        Esta seção será implementada no próximo bloco de funcionalidades.
      </p>
    </div>
  </AdminLayout>
);

export default AdminPlaceholder;
