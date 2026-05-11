export interface Supplier {
  id: string;
  name: string;
  kvk?: string;
  vatNumber?: string;
  iban?: string;
  emailDomain?: string;
  peppolParticipantId?: string;
  defaultCurrency: 'EUR' | 'USD' | 'GBP';
  isVerified: boolean;
  invoiceCount: number;
  lastInvoiceAt?: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  name: string;
  kvk?: string;
  vatNumber?: string;
  iban?: string;
  emailDomain?: string;
  peppolParticipantId?: string;
}
