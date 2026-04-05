import { createClient } from "@/lib/supabase/server"
import { getFluxoMaterialDashboardDataAction } from "@/components/almoxarifado/actions/fluxoMaterialActions"

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}))

describe("fluxoMaterialActions", () => {
  let fromMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    fromMock = jest.fn()

    ;(createClient as jest.Mock).mockResolvedValue({
      from: fromMock,
    })
  })

  it("carrega e mapeia dados do dashboard de fluxo de material", async () => {
    fromMock
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "entrada-1",
                  material_categoria_id: "mat-1",
                  quantidade: "10",
                  data: "2026-04-01",
                  cliente_id: "cliente-1",
                  observacao: "Entrada inicial",
                  created_at: "2026-04-01",
                  updated_at: "2026-04-01",
                  tipo: "ENTRADA",
                  material_categoria: { nome_do_material: "Cimento" },
                  clientes: { nome: "Cliente A" },
                },
              ],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                {
                  id: "saida-1",
                  material_categoria_id: "mat-1",
                  quantidade: "4",
                  data: "2026-04-02",
                  cliente_id: "cliente-1",
                  observacao: null,
                  created_at: "2026-04-02",
                  updated_at: "2026-04-02",
                  tipo: "SAIDA",
                  material_categoria: { nome_do_material: "Cimento" },
                  clientes: { nome: "Cliente A" },
                },
              ],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [{ id: "mat-1", nome_do_material: "Cimento" }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          data: [
            {
              id: "estoque-1",
              cliente_id: "cliente-1",
              material_categoria_id: "mat-1",
              estoque: "6",
              created_at: "2026-04-02",
              updated_at: "2026-04-02",
              material_categoria: { nome_do_material: "Cimento" },
              clientes: { nome: "Cliente A" },
            },
          ],
          error: null,
        }),
      })

    const result = await getFluxoMaterialDashboardDataAction()

    expect(result.ok).toBe(true)
    expect(result.data).toEqual({
      entradas: [
        expect.objectContaining({
          id: "entrada-1",
          material_id: "mat-1",
          quantidade: 10,
          material_nome: "Cimento",
          cliente_nome: "Cliente A",
        }),
      ],
      saidas: [
        expect.objectContaining({
          id: "saida-1",
          material_id: "mat-1",
          quantidade: 4,
          material_nome: "Cimento",
          cliente_nome: "Cliente A",
        }),
      ],
      estoques: [
        expect.objectContaining({
          id: "estoque-1",
          material_id: "mat-1",
          estoque: 6,
          material_nome: "Cimento",
          cliente_nome: "Cliente A",
        }),
      ],
      materiais: [{ id: "mat-1", nome: "Cimento" }],
    })
  })

  it("retorna erro quando uma query falha", async () => {
    fromMock
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: new Error("Falha entradas"),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ order: jest.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ order: jest.fn().mockResolvedValue({ data: [], error: null }) }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      })

    const result = await getFluxoMaterialDashboardDataAction()

    expect(result).toEqual({
      ok: false,
      error: "Falha entradas",
    })
  })
})