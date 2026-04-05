import {
  buildStockAdjustments,
  invertStockAdjustments,
} from "@/components/almoxarifado/actions/material-movimentacao-helpers"

describe("material-movimentacao-helpers", () => {
  it("cria ajuste positivo para uma entrada nova", () => {
    const adjustments = buildStockAdjustments(undefined, {
      clienteId: "cliente-1",
      materialId: "material-1",
      quantidade: 8,
      tipo: "ENTRADA",
    })

    expect(adjustments).toEqual([
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        delta: 8,
      },
    ])
  })

  it("calcula delta líquido ao editar uma entrada no mesmo cliente e material", () => {
    const adjustments = buildStockAdjustments(
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        quantidade: 5,
        tipo: "ENTRADA",
      },
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        quantidade: 9,
        tipo: "ENTRADA",
      }
    )

    expect(adjustments).toEqual([
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        delta: 4,
      },
    ])
  })

  it("reverte uma saída excluída devolvendo estoque ao cliente", () => {
    const adjustments = buildStockAdjustments(
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        quantidade: 3,
        tipo: "SAIDA",
      },
      undefined
    )

    expect(adjustments).toEqual([
      {
        clienteId: "cliente-1",
        materialId: "material-1",
        delta: 3,
      },
    ])
  })

  it("gera o inverso correto para rollback", () => {
    expect(
      invertStockAdjustments([
        { clienteId: "cliente-1", materialId: "material-1", delta: 7 },
        { clienteId: "cliente-2", materialId: "material-3", delta: -2 },
      ])
    ).toEqual([
      { clienteId: "cliente-1", materialId: "material-1", delta: -7 },
      { clienteId: "cliente-2", materialId: "material-3", delta: 2 },
    ])
  })
})