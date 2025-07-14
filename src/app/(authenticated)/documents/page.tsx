'use client';

import { DocumentManager } from "@/components/DocumentManager";
import { useSession } from "next-auth/react";

export default function DocumentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="flex-1 space-y-3 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#f5f5f7]">
            {isAdmin ? "Documents" : "My Documents"}
          </h2>
          <p className="text-xs text-[#f5f5f7]/50">
            Manage and share your documents
          </p>
        </div>
      </div>
      <DocumentManager />
    </div>
  );
} 