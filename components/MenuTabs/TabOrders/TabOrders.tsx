import React, {Dispatch, SetStateAction} from 'react';
import {api, Order} from "../../../lib/api";
import {Badge} from "../../Badge/Badge";
import {ArrowUpRight, Copy, ShoppingBag} from "lucide-react";
import {money} from "../../../utils/currency";

type TabOrdersProps = {
  query: string,
  setQuery: Dispatch<SetStateAction<string>>,
  filter: string,
  setFilter: Dispatch<SetStateAction<string>>,
  orders: Array<Order>,
  busy: boolean,
  mutate: (action: () => Promise<unknown>, success: string) => Promise<any>,
  copyLink: (value: string) => void
}


const TabOrders = ({query, setQuery, filter, setFilter, orders, busy, mutate, copyLink}: TabOrdersProps) => {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Recent orders</h2>
        <div className="row gap"><input aria-label="Search orders" placeholder="Search code, buyer or phone…"
                                        value={query} onChange={e => setQuery(e.target.value)}/><select
          aria-label="Filter orders" value={filter}
          onChange={e => setFilter(e.target.value)}>{['ALL', 'AWAITING_DETAILS', 'AWAITING_PAYMENT', 'DEPOSIT_PAID', 'PAID', 'PAYMENT_REVIEW', 'EXPIRED', 'CANCELLED'].map(f =>
          <option key={f}>{f}</option>)}</select></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
          <tr>
            <th>Order / buyer</th>
            <th>Product</th>
            <th>Total / received</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>{orders.map((o: any) => <tr key={o.id}>
              <td><strong>{o.code}</strong><p>{o.customerName || o.displayName}</p><span
                className="small muted">@{o.handle} · {o.phone}</span></td>
              <td>{o.product.name}<p className="small muted">{o.product.sku}</p></td>
              <td><strong>{money(o.total)}</strong><p className="small muted">{money(o.amountPaid)} received</p>
              </td>
              <td><Badge value={o.status}/>{o.payments.some((p: any) => ['RECONCILE', 'REVIEW'].includes(p.status)) &&
                  <p className="error small">Payment reconciliation needed</p>}</td>
              <td>
                <div className="row gap wrap">
                  <a className="icon-button" title="Open private checkout" href={o.checkoutUrl} target="_blank"
                     rel="noreferrer">
                    <ArrowUpRight size={16}/>
                  </a>
                  <button className="icon-button" title="Copy checkout link" onClick={() => void copyLink(o.checkoutUrl)}>
                    <Copy size={16}/>
                  </button>
                  <>
                    {
                      o.payments.filter((p: any) => ['CREATING', 'RECONCILE'].includes(p.status)).map((p: any) =>
                        <button key={p.id} className="text-button danger" disabled={busy} onClick={() => {
                          if (window.confirm('Check the provider and close any unpaid link? The buyer can create a new QR afterward.')) void mutate(() => api(`admin/payments/${p.id}/reconcile`, {}), 'Payment checked. Review the updated order status.');
                        }}>
                          Reconcile
                        </button>
                      )
                    }
                  </>
                  <button className="text-button" disabled={busy || ['EXPIRED', 'CANCELLED'].includes(o.status)}
                          onClick={() => void mutate(() => api(`admin/orders/${o.id}/notify`, {}), 'Notification queued.')}>
                    Resend
                  </button>
                  {
                    o.amountPaid === 0 && ['AWAITING_DETAILS', 'AWAITING_PAYMENT'].includes(o.status) &&
                      <button className="text-button danger" disabled={busy} onClick={() => {
                        if (window.confirm(`Cancel ${o.code} and release its stock?`)) void mutate(() => api(`admin/orders/${o.id}/cancel`, {}), 'Order cancelled.');
                      }}>
                          Cancel
                      </button>
                  }
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
        {
          orders.length === 0 &&
            <div className="empty">
                <ShoppingBag size={28}/>
                <p>No matching orders.</p>
            </div>
        }
      </div>
      <div className="panel-footer">Latest 100 orders. Private checkout links grant access to that order; share only with its buyer.
      </div>
    </section>
  );
};

export default TabOrders;