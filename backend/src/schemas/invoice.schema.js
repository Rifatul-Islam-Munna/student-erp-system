export const invoiceResponseSchema = {
    type: 'object',
    properties: {
        _id: { type: 'string' },
        invoiceNumber: { type: 'string' },
        recipientName: { type: 'string' },
        recipientEmail: { type: 'string' },
        items: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, quantity: { type: 'number' }, unitPrice: { type: 'number' }, amount: { type: 'number' } } } },
        subtotal: { type: 'number' },
        taxRate: { type: 'number' },
        taxAmount: { type: 'number' },
        discount: { type: 'number' },
        totalAmount: { type: 'number' },
        paidAmount: { type: 'number' },
        dueAmount: { type: 'number' },
        status: { type: 'string' },
        issueDate: { type: 'string', format: 'date-time' },
        dueDate: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' }
    }
};

export const getAllInvoicesSwagger = {
    tags: ['Invoices'],
    description: 'Get all invoices with pagination, filtering by status, student, branch, and date range',
    security: [{ bearerAuth: [] }],
    querystring: { type: 'object', properties: { page: { type: 'number' }, limit: { type: 'number' }, search: { type: 'string' }, status: { type: 'string' }, student: { type: 'string' }, branch: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } } }
};

export const getInvoiceByIdSwagger = { tags: ['Invoices'], description: 'Get invoice details by ID', security: [{ bearerAuth: [] }] };

export const createInvoiceSwagger = {
    tags: ['Invoices'],
    description: 'Create a new invoice with auto-generated invoice number and calculated totals',
    security: [{ bearerAuth: [] }],
    body: { type: 'object', required: ['recipientName', 'items', 'dueDate'], properties: { recipientName: { type: 'string' }, recipientEmail: { type: 'string' }, items: { type: 'array', items: { type: 'object' } }, taxRate: { type: 'number' }, discount: { type: 'number' }, dueDate: { type: 'string', format: 'date-time' } } }
};

export const recordPaymentSwagger = {
    tags: ['Invoices'],
    description: 'Record a payment against an invoice (auto-creates a Transaction)',
    security: [{ bearerAuth: [] }],
    body: { type: 'object', required: ['amount'], properties: { amount: { type: 'number' }, paymentMethod: { type: 'string' }, reference: { type: 'string' } } }
};

export const getInvoiceStatsSwagger = { tags: ['Invoices'], description: 'Get invoice statistics (totals, paid, overdue counts)', security: [{ bearerAuth: [] }] };
export const exportInvoicesSwagger = { tags: ['Invoices'], description: 'Export invoices to CSV', security: [{ bearerAuth: [] }] };
