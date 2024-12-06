import { Invoice } from './invoice';

export type ReceiptStatus = 'New' | 'On Hold' | 'Cancelled' | 'Reconciled';

export interface Receipt {
  id: string;
  dateReceipt: string;
  bank: string;
  receiptAmount: number;
  remark: string;
  imageUrl: string;
  status: ReceiptStatus;
  createdAt: string;
  // Invoice related fields
  invoiceNumber: string;
  clientName: string;
  phoneNumber: string;
  debtCollectorName: string;
  salesperson: string;
}