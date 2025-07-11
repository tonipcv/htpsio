import { DocumentManager } from "@/components/DocumentManager";

export default function DocumentsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Documentos</h1>
      <DocumentManager />
    </div>
  );
} 