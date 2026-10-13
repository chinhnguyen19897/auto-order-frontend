export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    method: body === undefined ? 'GET' : method, credentials: 'same-origin', cache: 'no-store',
    headers: body === undefined ? {} : {'Content-Type': 'application/json', 'X-Admin-Action': '1'},
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new ApiError(typeof result.message === 'string' ? result.message : 'Request failed.', response.status);
  return result as T;
}

export const money = (amount: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
}).format(amount);
export type Product = {
  id: string;
  sku: string;
  name: string;
  price: number;
  deposit: number;
  stock: number;
  active: boolean;
  version: number
};
export type Session = {
  id: string;
  title: string;
  username: string;
  currentProductId: string | null;
  status: string;
  connectionStatus: string;
  heartbeatAt: string | null;
  lastError: string | null
};
export type Order = {
  id: string;
  code: string;
  handle: string;
  displayName: string;
  phone: string;
  customerName: string | null;
  address: string | null;
  product: Product;
  total: number;
  deposit: number;
  amountPaid: number;
  status: string;
  checkoutUrl: string;
  createdAt: string;
  payments: { id: string; status: string; amount: number }[]
};
export type Comment = {
  id: string;
  sessionId: string;
  displayName: string;
  handle: string;
  text: string;
  status: string;
  reason: string | null;
  createdAt: string
};
export type DashboardData = {
  products: Product[];
  sessions: Session[];
  orders: Order[];
  comments: Comment[];
  unmatchedReceipts: { id: string; reference: string; orderCode: number; amount: number; status: string }[];
  notifications: {
    id: string;
    orderId: string;
    status: string;
    attempts: number;
    lastError: string | null;
    channel: string
  }[];
  metrics: { orders: number; total: number; collected: number; review: number };
  config: { demo: boolean; paymentProvider: string; notificationProvider: string }
};
export type CheckoutData = {
  code: string;
  product: { name: string; sku: string };
  total: number;
  deposit: number;
  amountPaid: number;
  status: string;
  phoneHint: string;
  customerName: string | null;
  address: string | null;
  reservedUntil: string;
  demo: boolean;
  payment: { id: string; amount: number; checkoutUrl: string | null; qrImage: string; expiresAt: string } | null
};
