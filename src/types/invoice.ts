export interface Invoice {
  id: string;
  dateInvoice: string;
  numberInvoice: string;
  statusInvoice: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  branch: string;
  clientName: string;
  amountDue: number;
  phoneNumber: string;
  phoneNumber2?: string;
  mykadNo: string;
  debtCollectorName?: string;
  salesperson: string;
  address: string;
  address2?: string;
  city: string;
  postcode: string;
  state: string;
  country: string;
  trackingNo?: string;
  ptp: boolean;
  totalBoxes: number;
  ptpDate?: string;
  ptpAmount?: number;
}