"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { calculateFinancialMetrics } from "@/components/pagamentos/libs/pagamentos-financial"
import type { Pagamentos, FinancialMetrics } from "@/lib/types"
import { ReceitaTableFull } from "@/components/pagamentos/receita-table-full"
import { ReceitaModal } from "@/components/pagamentos/receita-modal"
import { filterPayments, getAvailableMonth, getAvailableWeek, getAvailableYears, INITIAL_FILTERS } from "@/components/pagamentos/libs/pagamentos-filter-logic"
import { PaymentFiltersState } from "@/lib/types"
import { deletarPagamentoAction } from "@/components/actions/pagamentosDeleteLogic"
import { toast } from "@/hooks/use-toast"
import { PagamentosDeleteDialog } from "@/components/pagamentos/pagamentos-delete-dialog"
import { ReceitasHeader } from "../../components/pagamentos/receitas-header"


//teste

interface ReceitaPageContentProps {
    pagamentos: Pagamentos[]
    categories: { label: string; value: string }[]
    subcategories: { id: string; name: string; categories_id: string }[]
    metrics: FinancialMetrics
    userPermissions: Record<string, any>
}

interface DeleteState {
    isOpen: boolean
    pagamentos: Pagamentos | null
    isDeleting: boolean
}

export default function ReceitaPageContent({
    pagamentos,
    categories,
    subcategories,
    userPermissions
}: ReceitaPageContentProps) {

    // Estados de Filtro e View 
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState<PaymentFiltersState>({
        ...INITIAL_FILTERS,
        week: 'all'
    })

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<Pagamentos | null>(null)

    //Estado de Delete
    const [deleteState, setDeleteState] = useState<DeleteState>({
        isOpen: false,
        pagamentos: null,
        isDeleting: false,
    })

    // Contexto de Data
    const availableYears = useMemo(() => getAvailableYears(pagamentos), [pagamentos])
    const availableMonth = useMemo(() => getAvailableMonth(pagamentos), [pagamentos])

    // Contexto de Filtro e Métricas
    const filteredPagamentos = useMemo(() => {
        return filterPayments(pagamentos, filters, searchTerm)
    }, [pagamentos, searchTerm, filters])

    const currentMetrics = useMemo(() => {
        return calculateFinancialMetrics(filteredPagamentos)
    }, [filteredPagamentos])

    // Handlers de Filtros
    const updateFilter = (key: keyof PaymentFiltersState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({ ...INITIAL_FILTERS, week: 'all' })
        setSearchTerm("")
    }

    // Handlers do Modal 
    const handleNewPayment = () => {
        setSelectedPayment(null)
        setIsModalOpen(true)
    }

    const handleEditPayment = (payment: Pagamentos) => {
        setSelectedPayment(payment)
        setIsModalOpen(true)
    }

    const handleOpenDeleteDialog = useCallback((payment: Pagamentos) => {
        setDeleteState(prev => ({
            ...prev,
            isOpen: true,
            pagamentos: payment,
        }))
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteState(prev => ({
            ...prev,
            isOpen: false,
            pagamentos: null,
            isDeleting: false, // Reset deleting state
        }))
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        const { pagamentos } = deleteState
        if (!pagamentos) return
        setDeleteState(prev => ({ ...prev, isDeleting: true }))
        try {
            const result = await deletarPagamentoAction(pagamentos.id)
            if (!result.ok) throw new Error(result.error)
            toast({
                title: "Pagamento excluído!",
                description: "O registro foi removido com sucesso.",
            })
            handleCloseDeleteDialog()

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
            toast({
                title: "Erro ao excluir",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setDeleteState(prev => ({ ...prev, isDeleting: false }))
        }
    }, [deleteState, toast, handleCloseDeleteDialog])

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">

            <ReceitasHeader
                metrics={currentMetrics}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                availableYears={availableYears}
                availableMonth={availableMonth}
                onNewPayment={handleNewPayment}
            />

            <div className="flex-1 px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
                <Card className="border-0 rounded-xl sm:rounded-2xl shadow-lg min-h-[500px]">
                    <CardContent className="p-0">
                        <ReceitaTableFull
                            data={filteredPagamentos}
                            userPermissions={userPermissions}
                            categories={categories}
                            subcategories={subcategories}
                            onEdit={handleEditPayment}
                            onDelete={handleOpenDeleteDialog}
                        />
                    </CardContent>
                </Card>
            </div>

            <PagamentosDeleteDialog
                isOpen={deleteState.isOpen}
                pagamento={deleteState.pagamentos}
                isDeleting={deleteState.isDeleting}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
            />

            <ReceitaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                pagamento={selectedPayment}
                categories={categories}
                subcategories={subcategories}
            />
        </div>
    )
}

