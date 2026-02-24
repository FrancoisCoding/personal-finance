'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  FileText,
  Plus,
  Send,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'

const invoicesStorageKey = 'financeflow.invoices'

type TInvoiceStatus = 'DRAFT' | 'SENT' | 'PAID'
type TDisplayInvoiceStatus = TInvoiceStatus | 'OVERDUE'

interface IInvoiceRecord {
  id: string
  invoiceNumber: string
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  itemDescription: string
  quantity: number
  unitPrice: number
  notes: string
  status: TInvoiceStatus
  createdAt: string
}

interface IInvoiceFormState {
  invoiceNumber: string
  clientName: string
  clientEmail: string
  issueDate: string
  dueDate: string
  itemDescription: string
  quantity: string
  unitPrice: string
  notes: string
}

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createDefaultInvoiceFormState = (
  invoiceNumber: string
): IInvoiceFormState => {
  const today = new Date()
  const dueDate = new Date(today)
  dueDate.setDate(today.getDate() + 14)

  return {
    invoiceNumber,
    clientName: '',
    clientEmail: '',
    issueDate: formatDateInput(today),
    dueDate: formatDateInput(dueDate),
    itemDescription: '',
    quantity: '1',
    unitPrice: '',
    notes: '',
  }
}

const getDemoInvoices = (): IInvoiceRecord[] => {
  const today = new Date()
  const sentDate = new Date(today)
  sentDate.setDate(today.getDate() - 10)
  const sentDue = new Date(today)
  sentDue.setDate(today.getDate() - 2)
  const paidDate = new Date(today)
  paidDate.setDate(today.getDate() - 18)
  const paidDue = new Date(today)
  paidDue.setDate(today.getDate() - 5)
  const draftDate = new Date(today)
  draftDate.setDate(today.getDate() - 1)
  const draftDue = new Date(today)
  draftDue.setDate(today.getDate() + 13)

  return [
    {
      id: 'invoice-1',
      invoiceNumber: 'INV-1001',
      clientName: 'Northstar Creative',
      clientEmail: 'ops@northstarcreative.co',
      issueDate: formatDateInput(sentDate),
      dueDate: formatDateInput(sentDue),
      itemDescription: 'Monthly bookkeeping and reporting',
      quantity: 1,
      unitPrice: 850,
      notes: 'Includes monthly close summary and spending review.',
      status: 'SENT',
      createdAt: sentDate.toISOString(),
    },
    {
      id: 'invoice-2',
      invoiceNumber: 'INV-1002',
      clientName: 'Oakline Studio',
      clientEmail: 'billing@oakline.studio',
      issueDate: formatDateInput(paidDate),
      dueDate: formatDateInput(paidDue),
      itemDescription: 'Budget dashboard implementation sprint',
      quantity: 12,
      unitPrice: 125,
      notes: 'Final milestone payment.',
      status: 'PAID',
      createdAt: paidDate.toISOString(),
    },
    {
      id: 'invoice-3',
      invoiceNumber: 'INV-1003',
      clientName: 'Apex Advisory',
      clientEmail: 'finance@apexadvisory.io',
      issueDate: formatDateInput(draftDate),
      dueDate: formatDateInput(draftDue),
      itemDescription: 'Quarterly forecasting workshop',
      quantity: 1,
      unitPrice: 1200,
      notes: '',
      status: 'DRAFT',
      createdAt: draftDate.toISOString(),
    },
  ]
}

const parseStoredInvoices = (rawValue: string | null): IInvoiceRecord[] => {
  if (!rawValue) return []
  try {
    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => ({
        id: String(item?.id ?? generateId()),
        invoiceNumber: String(item?.invoiceNumber ?? ''),
        clientName: String(item?.clientName ?? ''),
        clientEmail: String(item?.clientEmail ?? ''),
        issueDate: String(item?.issueDate ?? ''),
        dueDate: String(item?.dueDate ?? ''),
        itemDescription: String(item?.itemDescription ?? ''),
        quantity: Number(item?.quantity ?? 0),
        unitPrice: Number(item?.unitPrice ?? 0),
        notes: String(item?.notes ?? ''),
        status: (item?.status ?? 'DRAFT') as TInvoiceStatus,
        createdAt: String(item?.createdAt ?? new Date().toISOString()),
      }))
      .filter(
        (invoice) =>
          invoice.invoiceNumber &&
          invoice.clientName &&
          invoice.itemDescription &&
          Number.isFinite(invoice.quantity) &&
          Number.isFinite(invoice.unitPrice)
      )
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime()
      )
  } catch {
    return []
  }
}

const getInvoiceTotal = (
  invoice: Pick<IInvoiceRecord, 'quantity' | 'unitPrice'>
) => Math.max(invoice.quantity, 0) * Math.max(invoice.unitPrice, 0)

const getDisplayInvoiceStatus = (
  invoice: IInvoiceRecord
): TDisplayInvoiceStatus => {
  if (invoice.status === 'PAID') return 'PAID'
  if (invoice.status === 'DRAFT') return 'DRAFT'
  const dueDate = new Date(invoice.dueDate)
  dueDate.setHours(23, 59, 59, 999)
  const isOverdue = dueDate.getTime() < Date.now()
  return isOverdue ? 'OVERDUE' : 'SENT'
}

const getStatusClassName = (status: TDisplayInvoiceStatus) => {
  if (status === 'PAID') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
  }
  if (status === 'OVERDUE') {
    return 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-300'
  }
  if (status === 'SENT') {
    return 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300'
  }
  return 'border-border/70 bg-muted/20 text-muted-foreground'
}

const getNextInvoiceNumber = (invoices: IInvoiceRecord[]) => {
  const maxSequence = invoices.reduce((maxValue, invoice) => {
    const match = invoice.invoiceNumber.match(/(\d+)$/)
    if (!match) return maxValue
    return Math.max(maxValue, Number(match[1]))
  }, 1000)

  return `INV-${maxSequence + 1}`
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const buildInvoiceHtmlDocument = (invoice: IInvoiceRecord) => {
  const total = getInvoiceTotal(invoice)
  const displayStatus = getDisplayInvoiceStatus(invoice)
  const notesHtml = invoice.notes
    ? `<div class="section">
        <h3>Notes</h3>
        <p>${escapeHtml(invoice.notes).replaceAll('\n', '<br />')}</p>
      </div>`
    : ''

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(invoice.invoiceNumber)} - Invoice</title>
    <style>
      :root {
        color-scheme: light;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        background: #f8fafc;
        color: #0f172a;
        padding: 24px;
      }
      .invoice {
        max-width: 880px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 24px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(180deg, #f8fafc, #ffffff);
      }
      .brand {
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #64748b;
      }
      h1 {
        margin: 6px 0 0;
        font-size: 28px;
        line-height: 1.1;
      }
      .muted {
        color: #64748b;
        font-size: 13px;
      }
      .status {
        align-self: flex-start;
        border-radius: 999px;
        border: 1px solid #cbd5e1;
        padding: 6px 10px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        padding: 24px;
      }
      .panel {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 14px;
        background: #fff;
      }
      .panel h3 {
        margin: 0 0 8px;
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .panel p {
        margin: 0;
        line-height: 1.45;
      }
      .line-items {
        padding: 0 24px 24px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
      }
      th, td {
        padding: 12px 14px;
        border-bottom: 1px solid #e2e8f0;
        font-size: 14px;
        text-align: left;
      }
      th {
        color: #64748b;
        font-weight: 600;
        background: #f8fafc;
      }
      td.number, th.number {
        text-align: right;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .total-row td {
        font-weight: 700;
        background: #fcfcfd;
      }
      .section {
        padding: 0 24px 24px;
      }
      .section h3 {
        margin: 0 0 8px;
        font-size: 12px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .section p {
        margin: 0;
        line-height: 1.55;
        white-space: normal;
      }
      .footer {
        border-top: 1px solid #e2e8f0;
        padding: 16px 24px 20px;
        color: #64748b;
        font-size: 12px;
      }
      @media print {
        body { background: #fff; padding: 0; }
        .invoice { border: none; box-shadow: none; border-radius: 0; }
      }
    </style>
  </head>
  <body>
    <article class="invoice">
      <header class="header">
        <div>
          <div class="brand">FinanceFlow Invoice</div>
          <h1>${escapeHtml(invoice.invoiceNumber)}</h1>
          <p class="muted">Created ${escapeHtml(formatDate(invoice.createdAt))}</p>
        </div>
        <div class="status">${escapeHtml(displayStatus)}</div>
      </header>

      <section class="grid">
        <div class="panel">
          <h3>Billed To</h3>
          <p>${escapeHtml(invoice.clientName)}</p>
          ${
            invoice.clientEmail
              ? `<p class="muted">${escapeHtml(invoice.clientEmail)}</p>`
              : ''
          }
        </div>
        <div class="panel">
          <h3>Invoice Dates</h3>
          <p><strong>Issue date:</strong> ${escapeHtml(
            formatDate(invoice.issueDate)
          )}</p>
          <p><strong>Due date:</strong> ${escapeHtml(formatDate(invoice.dueDate))}</p>
        </div>
      </section>

      <section class="line-items">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="number">Qty</th>
              <th class="number">Unit Price</th>
              <th class="number">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(invoice.itemDescription)}</td>
              <td class="number">${invoice.quantity}</td>
              <td class="number">${escapeHtml(
                formatCurrency(invoice.unitPrice)
              )}</td>
              <td class="number">${escapeHtml(formatCurrency(total))}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">Total</td>
              <td class="number">${escapeHtml(formatCurrency(total))}</td>
            </tr>
          </tbody>
        </table>
      </section>

      ${notesHtml}

      <footer class="footer">
        Exported from FinanceFlow. This is a basic invoice export for review and recordkeeping.
      </footer>
    </article>
  </body>
</html>`
}

export default function InvoicesPage() {
  const { isDemoMode } = useDemoMode()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const [invoices, setInvoices] = useState<IInvoiceRecord[]>([])
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [formState, setFormState] = useState<IInvoiceFormState>(
    createDefaultInvoiceFormState('INV-1001')
  )

  const hasProAccess =
    isDemoMode ||
    billingData?.isSuperUser === true ||
    billingData?.currentPlan === 'PRO'

  useEffect(() => {
    try {
      const stored = parseStoredInvoices(
        window.localStorage.getItem(invoicesStorageKey)
      )
      if (stored.length > 0) {
        setInvoices(stored)
      } else if (isDemoMode) {
        setInvoices(getDemoInvoices())
      } else {
        setInvoices([])
      }
    } catch {
      setInvoices(isDemoMode ? getDemoInvoices() : [])
    } finally {
      setHasLoadedStorage(true)
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!hasLoadedStorage) return
    try {
      window.localStorage.setItem(invoicesStorageKey, JSON.stringify(invoices))
    } catch {
      return
    }
  }, [hasLoadedStorage, invoices])

  useEffect(() => {
    setFormState((previousState) => {
      const nextInvoiceNumber = getNextInvoiceNumber(invoices)
      if (
        previousState.clientName ||
        previousState.itemDescription ||
        previousState.unitPrice
      ) {
        return previousState
      }
      if (previousState.invoiceNumber === nextInvoiceNumber) {
        return previousState
      }
      return {
        ...previousState,
        invoiceNumber: nextInvoiceNumber,
      }
    })
  }, [invoices])

  const formQuantity = Number(formState.quantity || '0')
  const formUnitPrice = Number(formState.unitPrice || '0')
  const formInvoiceTotal =
    Number.isFinite(formQuantity) && Number.isFinite(formUnitPrice)
      ? Math.max(formQuantity, 0) * Math.max(formUnitPrice, 0)
      : 0

  const invoiceSummary = useMemo(() => {
    const summary = {
      totalBilled: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      overdueCount: 0,
      sentCount: 0,
    }

    invoices.forEach((invoice) => {
      const total = getInvoiceTotal(invoice)
      const displayStatus = getDisplayInvoiceStatus(invoice)
      summary.totalBilled += total

      if (displayStatus === 'PAID') {
        summary.totalPaid += total
      } else {
        summary.totalOutstanding += total
      }

      if (displayStatus === 'OVERDUE') {
        summary.overdueCount += 1
      }

      if (displayStatus === 'SENT') {
        summary.sentCount += 1
      }
    })

    return summary
  }, [invoices])

  const handleFormValueChange = (
    field: keyof IInvoiceFormState,
    value: string
  ) => {
    setFormState((previousState) => ({
      ...previousState,
      [field]: value,
    }))
  }

  const handleCreateInvoice = () => {
    const clientName = formState.clientName.trim()
    const clientEmail = formState.clientEmail.trim()
    const itemDescription = formState.itemDescription.trim()
    const quantity = Number(formState.quantity)
    const unitPrice = Number(formState.unitPrice)

    if (!clientName || !itemDescription) return
    if (!Number.isFinite(quantity) || quantity <= 0) return
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return

    const nextInvoice: IInvoiceRecord = {
      id: generateId(),
      invoiceNumber:
        formState.invoiceNumber.trim() || getNextInvoiceNumber(invoices),
      clientName,
      clientEmail,
      issueDate: formState.issueDate,
      dueDate: formState.dueDate,
      itemDescription,
      quantity,
      unitPrice,
      notes: formState.notes.trim(),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
    }

    setInvoices((previousInvoices) => [nextInvoice, ...previousInvoices])
    setFormState(
      createDefaultInvoiceFormState(
        getNextInvoiceNumber([nextInvoice, ...invoices])
      )
    )
  }

  const handleUpdateInvoiceStatus = (id: string, status: TInvoiceStatus) => {
    setInvoices((previousInvoices) =>
      previousInvoices.map((invoice) =>
        invoice.id === id ? { ...invoice, status } : invoice
      )
    )
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices((previousInvoices) =>
      previousInvoices.filter((invoice) => invoice.id !== id)
    )
  }

  const handleDownloadInvoice = (invoice: IInvoiceRecord) => {
    const htmlDocument = buildInvoiceHtmlDocument(invoice)
    const blob = new Blob([htmlDocument], {
      type: 'text/html;charset=utf-8',
    })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${invoice.invoiceNumber}.html`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  }

  if (isBillingLoading && !isDemoMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Loading invoice workspace...
        </p>
      </div>
    )
  }

  if (!hasProAccess) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl">Invoices</CardTitle>
          <CardDescription>
            Basic invoicing is available on the Pro plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro to create invoices, track due dates, and monitor paid
            versus outstanding client revenue.
          </p>
          <Button asChild>
            <Link href="/billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-start justify-between gap-3"
        data-demo-step="demo-invoices-header"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create basic invoices, track payment status, and manage receivables
            in your Pro workspace.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/billing">Manage plan</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total billed
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(invoiceSummary.totalBilled)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Paid
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
              {formatCurrency(invoiceSummary.totalPaid)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Outstanding
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-300">
              {formatCurrency(invoiceSummary.totalOutstanding)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Overdue invoices
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {invoiceSummary.overdueCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {invoiceSummary.sentCount} currently sent and not paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card
          className="border-border/70 bg-card/90"
          data-demo-step="demo-invoices-create"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create invoice</CardTitle>
            <CardDescription>
              Simple one-line invoice builder for quick client billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice number</Label>
                <Input
                  id="invoice-number"
                  value={formState.invoiceNumber}
                  onChange={(event) =>
                    handleFormValueChange('invoiceNumber', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-client">Client name</Label>
                <Input
                  id="invoice-client"
                  value={formState.clientName}
                  onChange={(event) =>
                    handleFormValueChange('clientName', event.target.value)
                  }
                  placeholder="Acme Co."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-email">Client email</Label>
                <Input
                  id="invoice-email"
                  type="email"
                  value={formState.clientEmail}
                  onChange={(event) =>
                    handleFormValueChange('clientEmail', event.target.value)
                  }
                  placeholder="billing@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-issue-date">Issue date</Label>
                <Input
                  id="invoice-issue-date"
                  type="date"
                  value={formState.issueDate}
                  onChange={(event) =>
                    handleFormValueChange('issueDate', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-due-date">Due date</Label>
                <Input
                  id="invoice-due-date"
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) =>
                    handleFormValueChange('dueDate', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-quantity">Quantity</Label>
                <Input
                  id="invoice-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={formState.quantity}
                  onChange={(event) =>
                    handleFormValueChange('quantity', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice-item-description">Description</Label>
                <Input
                  id="invoice-item-description"
                  value={formState.itemDescription}
                  onChange={(event) =>
                    handleFormValueChange('itemDescription', event.target.value)
                  }
                  placeholder="Monthly accounting services"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-unit-price">Unit price</Label>
                <Input
                  id="invoice-unit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.unitPrice}
                  onChange={(event) =>
                    handleFormValueChange('unitPrice', event.target.value)
                  }
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-total-preview">Invoice total</Label>
                <Input
                  id="invoice-total-preview"
                  value={formatCurrency(formInvoiceTotal)}
                  readOnly
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="invoice-notes">Notes</Label>
                <Textarea
                  id="invoice-notes"
                  value={formState.notes}
                  onChange={(event) =>
                    handleFormValueChange('notes', event.target.value)
                  }
                  className="min-h-[88px]"
                  placeholder="Optional payment terms or project notes"
                />
              </div>
            </div>

            <Button onClick={handleCreateInvoice} className="gap-2">
              <Plus className="h-4 w-4" />
              Create invoice
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent invoices</CardTitle>
            <CardDescription>
              Quick status actions for your most recent client invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
                Create your first invoice to start tracking paid and outstanding
                revenue.
              </div>
            ) : (
              invoices.slice(0, 4).map((invoice) => {
                const displayStatus = getDisplayInvoiceStatus(invoice)
                const invoiceTotal = getInvoiceTotal(invoice)
                return (
                  <div
                    key={invoice.id}
                    className="rounded-xl border border-border/60 bg-card/70 p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.clientName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusClassName(displayStatus)}
                      >
                        {displayStatus}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{formatCurrency(invoiceTotal)}</span>
                      <span>Due {formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() =>
                          handleUpdateInvoiceStatus(invoice.id, 'SENT')
                        }
                      >
                        <Send className="h-3.5 w-3.5" />
                        Mark sent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() =>
                          handleUpdateInvoiceStatus(invoice.id, 'PAID')
                        }
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Mark paid
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card
        className="border-border/70 bg-card/90"
        data-demo-step="demo-invoices-list"
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Invoice list</CardTitle>
          <CardDescription>
            Review invoice details, due dates, and payment status in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-8 text-sm text-muted-foreground">
              No invoices yet. Use the invoice form above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Issue date</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const displayStatus = getDisplayInvoiceStatus(invoice)
                    const total = getInvoiceTotal(invoice)
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="font-medium text-foreground">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {invoice.itemDescription}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground">
                              {invoice.clientName}
                            </p>
                            {invoice.clientEmail ? (
                              <p className="text-xs text-muted-foreground">
                                {invoice.clientEmail}
                              </p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.issueDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatCurrency(total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusClassName(displayStatus)}
                          >
                            {displayStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() => handleDownloadInvoice(invoice)}
                              aria-label={`Download ${invoice.invoiceNumber}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() =>
                                handleUpdateInvoiceStatus(invoice.id, 'DRAFT')
                              }
                            >
                              Draft
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() =>
                                handleUpdateInvoiceStatus(invoice.id, 'SENT')
                              }
                            >
                              Sent
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2"
                              onClick={() =>
                                handleUpdateInvoiceStatus(invoice.id, 'PAID')
                              }
                            >
                              Paid
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-muted-foreground hover:text-rose-500"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              aria-label={`Delete ${invoice.invoiceNumber}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
