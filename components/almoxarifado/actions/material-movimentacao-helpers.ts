export type TipoMovimentacaoMaterial = "ENTRADA" | "SAIDA"

export interface MovimentacaoSnapshot {
  clienteId?: string | null
  materialId: string
  quantidade: number
  tipo: TipoMovimentacaoMaterial
}

export interface StockAdjustment {
  clienteId: string
  materialId: string
  delta: number
}

interface ClienteMaterialRow {
  id: string
  estoque: number
}

export function buildStockAdjustments(
  previous?: MovimentacaoSnapshot | null,
  next?: MovimentacaoSnapshot | null
): StockAdjustment[] {
  const adjustments = new Map<string, StockAdjustment>()

  const appendAdjustment = (clienteId: string | null | undefined, materialId: string, delta: number) => {
    if (!clienteId || !materialId || delta === 0) return

    const key = `${clienteId}:${materialId}`
    const current = adjustments.get(key)

    adjustments.set(key, {
      clienteId,
      materialId,
      delta: (current?.delta || 0) + delta,
    })
  }

  if (previous) {
    appendAdjustment(
      previous.clienteId,
      previous.materialId,
      previous.tipo === "ENTRADA" ? -previous.quantidade : previous.quantidade
    )
  }

  if (next) {
    appendAdjustment(
      next.clienteId,
      next.materialId,
      next.tipo === "ENTRADA" ? next.quantidade : -next.quantidade
    )
  }

  return Array.from(adjustments.values()).filter((adjustment) => adjustment.delta !== 0)
}

export function invertStockAdjustments(adjustments: StockAdjustment[]): StockAdjustment[] {
  return adjustments.map((adjustment) => ({
    ...adjustment,
    delta: adjustment.delta * -1,
  }))
}

async function getClienteMaterialRow(
  supabase: any,
  clienteId: string,
  materialId: string
): Promise<ClienteMaterialRow | null> {
  const { data, error } = await supabase
    .from("clientes_material")
    .select("id, estoque")
    .eq("cliente_id", clienteId)
    .eq("material_categoria_id", materialId)
    .maybeSingle()

  if (error) throw error

  if (!data) return null

  return {
    id: data.id,
    estoque: Number(data.estoque || 0),
  }
}

export async function applyStockAdjustments(supabase: any, adjustments: StockAdjustment[]) {
  const currentRows = new Map<string, ClienteMaterialRow | null>()

  for (const adjustment of adjustments) {
    const key = `${adjustment.clienteId}:${adjustment.materialId}`
    const row = await getClienteMaterialRow(supabase, adjustment.clienteId, adjustment.materialId)
    currentRows.set(key, row)

    const currentStock = row?.estoque || 0
    const nextStock = currentStock + adjustment.delta

    if (nextStock < 0) {
      throw new Error("Estoque insuficiente para este cliente e material.")
    }
  }

  for (const adjustment of adjustments) {
    const key = `${adjustment.clienteId}:${adjustment.materialId}`
    const row = currentRows.get(key)
    const currentStock = row?.estoque || 0
    const nextStock = currentStock + adjustment.delta

    if (row) {
      const { error } = await supabase
        .from("clientes_material")
        .update({
          estoque: nextStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)

      if (error) throw error
      continue
    }

    const { error } = await supabase.from("clientes_material").insert({
      cliente_id: adjustment.clienteId,
      material_categoria_id: adjustment.materialId,
      estoque: nextStock,
    })

    if (error) throw error
  }
}