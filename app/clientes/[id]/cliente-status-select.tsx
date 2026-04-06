"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Cliente } from "@/lib/types";
import { updateClienteStatus } from "./actions";

interface ClienteStatusSelectProps {
  cliente: Cliente;
}

export function ClienteStatusSelect({ cliente }: ClienteStatusSelectProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(cliente.status || "PENDENTE");

  const handleStatusChange = async (newStatus: "FINALIZADO" | "EM ANDAMENTO" | "PENDENTE") => {
    if (newStatus === currentStatus) return;
    
    setIsUpdating(true);
    setCurrentStatus(newStatus);

    try {
      // Usar server action para atualizar e revalidar cache
      await updateClienteStatus(cliente.id, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      // Reverter para o status anterior em caso de erro
      setCurrentStatus(cliente.status || "PENDENTE");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "FINALIZADO":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            <span className="text-sm">FINALIZADO</span>
          </div>
        );
      case "EM ANDAMENTO":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-sm">EM ANDAMENTO</span>
          </div>
        );
      case "PENDENTE":
      default:
        return (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="text-sm">PENDENTE</span>
          </div>
        );
    }
  };

  return (
    <div className="relative z-[100]">
      <Select 
        value={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full border-2 focus:ring-[#F5C800] h-9 text-sm relative z-[100]">
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-sm">Atualizando...</span>
            </div>
          ) : (
            <SelectValue>
              {getStatusDisplay(currentStatus)}
            </SelectValue>
          )}
        </SelectTrigger>
        <SelectContent className="!z-[9999] bg-white border-2 shadow-xl" style={{ zIndex: 9999 }}>
          <SelectItem value="PENDENTE">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <span>PENDENTE</span>
            </div>
          </SelectItem>
          <SelectItem value="EM ANDAMENTO">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span>EM ANDAMENTO</span>
            </div>
          </SelectItem>
          <SelectItem value="FINALIZADO">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span>FINALIZADO</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
