import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import { api } from '@/../convex/_generated/api'
import { useTerminal } from '../terminal-provider'

type StatementType = 'income' | 'balance_sheet' | 'cash_flow'
type Period = 'annual' | 'quarterly'

const STATEMENT_TABS: { key: StatementType; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'balance_sheet', label: 'Balance Sheet' },
  { key: 'cash_flow', label: 'Cash Flow' },
]

const INCOME_ROWS = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costOfRevenue', label: 'Cost of Revenue' },
  { key: 'grossProfit', label: 'Gross Profit' },
  { key: 'researchAndDevelopmentExpenses', label: 'R&D' },
  { key: 'sellingGeneralAndAdministrativeExpenses', label: 'SG&A' },
  { key: 'operatingExpenses', label: 'Operating Expenses' },
  { key: 'operatingIncome', label: 'Operating Income' },
  { key: 'interestExpense', label: 'Interest Expense' },
  { key: 'incomeBeforeTax', label: 'Income Before Tax' },
  { key: 'incomeTaxExpense', label: 'Tax Expense' },
  { key: 'netIncome', label: 'Net Income' },
  { key: 'eps', label: 'EPS' },
  { key: 'epsdiluted', label: 'EPS (Diluted)' },
  { key: 'weightedAverageShsOutDil', label: 'Shares Out (Dil)' },
]

const BALANCE_SHEET_ROWS = [
  { key: 'cashAndCashEquivalents', label: 'Cash & Equivalents' },
  { key: 'shortTermInvestments', label: 'Short-Term Investments' },
  { key: 'netReceivables', label: 'Receivables' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'totalCurrentAssets', label: 'Total Current Assets' },
  { key: 'propertyPlantEquipmentNet', label: 'PP&E (Net)' },
  { key: 'goodwill', label: 'Goodwill' },
  { key: 'totalAssets', label: 'Total Assets' },
  { key: 'totalCurrentLiabilities', label: 'Total Current Liabilities' },
  { key: 'longTermDebt', label: 'Long-Term Debt' },
  { key: 'totalLiabilities', label: 'Total Liabilities' },
  { key: 'totalStockholdersEquity', label: 'Stockholders Equity' },
  { key: 'totalLiabilitiesAndStockholdersEquity', label: 'Total L + SE' },
]

const CASH_FLOW_ROWS = [
  { key: 'netIncome', label: 'Net Income' },
  { key: 'depreciationAndAmortization', label: 'D&A' },
  { key: 'stockBasedCompensation', label: 'Stock-Based Comp' },
  { key: 'changeInWorkingCapital', label: 'Change in WC' },
  { key: 'operatingCashFlow', label: 'Operating Cash Flow' },
  { key: 'capitalExpenditure', label: 'CapEx' },
  { key: 'investmentsInPropertyPlantAndEquipment', label: 'Investments in PP&E' },
  { key: 'netCashUsedForInvestingActivites', label: 'Investing Cash Flow' },
  { key: 'debtRepayment', label: 'Debt Repayment' },
  { key: 'commonStockRepurchased', label: 'Buybacks' },
  { key: 'dividendsPaid', label: 'Dividends Paid' },
  { key: 'netCashUsedProvidedByFinancingActivities', label: 'Financing Cash Flow' },
  { key: 'freeCashFlow', label: 'Free Cash Flow' },
]

const ROWS_BY_TYPE: Record<StatementType, { key: string; label: string }[]> = {
  income: INCOME_ROWS,
  balance_sheet: BALANCE_SHEET_ROWS,
  cash_flow: CASH_FLOW_ROWS,
}

function formatFinancial(value: number | undefined | null): string {
  if (value === undefined || value === null || value === 0) return '—'
  const abs = Math.abs(value)
  const formatted =
    abs >= 1e9
      ? `$${(abs / 1e9).toFixed(1)}B`
      : abs >= 1e6
        ? `$${(abs / 1e6).toFixed(0)}M`
        : abs >= 1e3
          ? `$${(abs / 1e3).toFixed(0)}K`
          : `$${abs.toFixed(2)}`
  return value < 0 ? `(${formatted})` : formatted
}

export function FinancialsPanel() {
  const { state } = useTerminal()
  const symbol = state.activeSecurity
  const [statementType, setStatementType] = useState<StatementType>('income')
  const [period, setPeriod] = useState<Period>('annual')

  const statementDoc = useQuery(
    api.market.financials.getStatement,
    symbol ? { symbol, statementType, period } : 'skip'
  )
  const requestStatement = useMutation(api.market.financials.requestStatement)

  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!symbol) return
    const key = `${symbol}-${statementType}-${period}`
    if (key !== prevKeyRef.current) {
      prevKeyRef.current = key
      requestStatement({ symbol, statementType, period })
    }
  }, [symbol, statementType, period, requestStatement])

  const periods = useMemo(() => {
    if (!statementDoc?.data) return []
    try {
      return JSON.parse(statementDoc.data) as Array<Record<string, unknown>>
    } catch {
      return []
    }
  }, [statementDoc?.data])

  const rows = ROWS_BY_TYPE[statementType]

  if (!symbol) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-t-muted text-xs">Select a security to view financials</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-terminal px-3 py-1">
        <span className="text-amber mr-2 text-xs font-semibold">{symbol}</span>
        {STATEMENT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatementType(tab.key)}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              tab.key === statementType
                ? 'bg-[var(--terminal-amber)] text-[var(--terminal-bg)]'
                : 'text-t-muted hover:text-t-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setPeriod('annual')}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              period === 'annual'
                ? 'bg-[var(--terminal-surface)] text-t-primary'
                : 'text-t-muted hover:text-t-primary'
            }`}
          >
            Annual
          </button>
          <button
            onClick={() => setPeriod('quarterly')}
            className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
              period === 'quarterly'
                ? 'bg-[var(--terminal-surface)] text-t-primary'
                : 'text-t-muted hover:text-t-primary'
            }`}
          >
            Quarterly
          </button>
        </div>
      </div>

      {statementDoc === undefined ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-t-muted animate-pulse text-xs">Loading financials...</p>
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-t-muted text-xs">No data available</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10 bg-[var(--terminal-bg)]">
              <tr>
                <th className="sticky left-0 z-20 bg-[var(--terminal-bg)] px-3 py-1.5 text-left text-t-muted font-medium">
                  Item
                </th>
                {periods.map((p) => (
                  <th
                    key={String(p.date ?? p.calendarYear)}
                    className="whitespace-nowrap px-3 py-1.5 text-right text-t-muted font-medium"
                  >
                    {period === 'quarterly'
                      ? String(p.date ?? '').slice(0, 7)
                      : String(p.calendarYear ?? p.date ?? '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className="border-t border-[var(--terminal-border)] hover:bg-[var(--terminal-surface-hover)]"
                >
                  <td className="sticky left-0 bg-[var(--terminal-bg)] px-3 py-1 text-t-secondary whitespace-nowrap">
                    {row.label}
                  </td>
                  {periods.map((p) => {
                    const val = p[row.key] as number | undefined | null
                    return (
                      <td
                        key={String(p.date ?? p.calendarYear)}
                        className={`px-3 py-1 text-right tabular-nums whitespace-nowrap ${
                          val != null && val < 0 ? 'text-down' : 'text-t-primary'
                        }`}
                      >
                        {formatFinancial(val)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
