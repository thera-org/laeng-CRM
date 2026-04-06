"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

interface ClientSearchInputProps {
  value: string
  onChange: (value: string) => void
  clients: { id: string; nome: string; codigo?: number }[]
  placeholder?: string
}

export function ClientSearchInput({
  value,
  onChange,
  clients,
  placeholder = "Buscar por cliente...",
}: ClientSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false)

  const suggestions = useMemo(() => {
    const term = value.trim().toLowerCase()
    if (term.length < 2) return []

    return clients
      .filter((client) => client.nome.toLowerCase().includes(term))
      .slice(0, 6)
  }, [clients, value])

  return (
    <div className="flex-1 relative group">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#F5C800]" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120)
        }}
        className="pl-10 h-10 bg-white border-0 text-gray-900 placeholder:text-gray-500 rounded-md shadow-sm w-full"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute mt-1 w-full z-20 bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto">
          {suggestions.map((client) => (
            <button
              key={client.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(client.nome)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 hover:bg-gray-50 text-left text-sm text-[#1E1E1E] border-b border-gray-100 last:border-0 transition-colors"
            >
              <span className="font-medium">{client.nome}</span>
              {client.codigo ? <span className="ml-2 text-xs text-gray-500">#{String(client.codigo).padStart(3, "0")}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}