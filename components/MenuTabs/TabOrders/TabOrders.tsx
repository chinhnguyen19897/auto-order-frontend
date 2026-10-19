import React, {Dispatch, SetStateAction, useState} from 'react';
import {tableFeatures, useTable} from '@tanstack/react-table'
import type {ColumnDef} from '@tanstack/react-table'
import {api} from "../../../lib/api";
import {Badge} from "../../Badge/Badge";
import {ArrowUpRight, Copy, ShoppingBag} from "lucide-react";
import {money} from "../../../utils/currency";
import {Order} from "../../../types/common";
import {checkLabels, matchesOrderFilter, workflowOptions, issueOptions} from '../../../lib/order-checks';
import OrderChecks from './OrderChecks';
import Link from "next/link";

type TabOrdersProps = {
  query: string,
  setQuery: Dispatch<SetStateAction<string>>,
  filter: string,
  setFilter: Dispatch<SetStateAction<string>>,
  orders: Array<Order>,
  allOrders: Array<Order>,
  busy: boolean,
  mutate: (action: () => Promise<unknown>, success: string) => Promise<any>,
  copyLink: (value: string) => void
}


const TabOrders = ({query, setQuery, filter, setFilter, orders, allOrders, busy, mutate, copyLink}: TabOrdersProps) => {
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const checking = allOrders.find(order => order.id === checkingId);

  const features = tableFeatures({})

  const columns: Array<ColumnDef<typeof features, Order>> = [
    {
      accessorKey: 'code',
      header: 'Order / buyer',
      cell: ({row}) => {
        const o = row.original;

        return (
          <>
            <strong>{o.code}</strong>
            <p className="small muted">{new Date(o.createdAt).toLocaleTimeString()}</p>
            {/* <p>{o.customerName || o.displayName}</p>
            <span className="small muted">
            @{o.handle} · {o.phone}
          </span>*/}
          </>
        );
      },
    },
    {
      accessorKey: 'displayName',
      header: 'Customer',
      cell: ({row}) => {
        return (
          <>
            <p>{row.original.customerName || row.original.displayName}</p>
            <span>{row.original.handle}</span>
          </>
        )
      }
    },
    {
      accessorKey: 'product',
      header: 'Items',
      cell: (info) => {
        const products = info.row.original.product;

        return (
          <>
            <span>{products.name}</span>
            <p className="small muted">{products.sku}</p>
          </>
        )

      }
    },
    {
      accessorKey: 'Total',
      header: 'Total / received',
      cell: ({row}) => {
        const {total, amountPaid} = row.original;

        return (
          <>
            <strong>{money(total)}</strong>
            <p className="small muted">
              {money(amountPaid)} received
            </p>
          </>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({row}) => {
        const {checkStatus} = row.original;


        const typeStatus = checkLabels[checkStatus] ?? checkStatus

        return (
          <>
            <Badge value={typeStatus}/>
          </>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: () => '',
      cell: ({row}) => {
        const o = row.original;
        return (
          <div className="row gap wrap">
            {typeActions(o.checkStatus)}
            {/*<a
              className="icon-button"
              title="Open private checkout"
              href={o.checkoutUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ArrowUpRight size={16}/>
            </a>

            <button
              className="icon-button"
              title="Copy checkout link"
              onClick={() => copyLink(o.checkoutUrl)}
            >
              <Copy size={16}/>
            </button>

            <button
              className="text-button"
              disabled={
                busy ||
                ['EXPIRED', 'CANCELLED'].includes(o.status)
              }
              onClick={() =>
                void mutate(
                  () => api(`admin/orders/${o.id}/notify`, {}),
                  'Notification queued.'
                )
              }
            >
              Resend
            </button>*/}
          </div>
        );
      },
    }
  ]

  const table = useTable({
    key: 'orders-table',
    features,
    columns,
    data: orders
  })

  const typeActions = (type: string) => {
    switch (type) {
      case 'NEED_MATCHING':
        return <>
          <Link className="icon-button"
             title="Zalo matching"
             href='/zalo-matching'
             rel="noreferrer"
          >
            Zalo matching
            <ArrowUpRight size={16}/>
          </Link>
        </>
      case 'READY':
      case 'ORDER':
      case 'CONFIRMED':
        return <>
          <a className="icon-button" title="View order">
            View order
            <ArrowUpRight size={16}/>
          </a>
        </>
      case 'MISSING_PHONE':
      case 'DUPLICATE':
        return <>
          <a className="icon-button" title="Review">
            Review
            <ArrowUpRight size={16}/>
          </a>
        </>
      case 'CANCELLED':
      case 'EXPIRED':
        return <>
          <a title="Resend" aria-disabled="false" href='/zalo-matching'>
            Resend
            <ArrowUpRight size={16} />
          </a>
        </>
      default:
        break;

    }
  }


  return (
    <section className="panel">
      <div className="order-check-tabs" aria-label="Order check filters">
        {['ALL', 'NEEDS_MATCHING', 'READY', 'ISSUES'].map(value => <button type="button" key={value}
                                                                           aria-pressed={filter === value}
                                                                           className={filter === value ? 'active' : ''}
                                                                           onClick={() => setFilter(value)}>{checkLabels[value]}
          <span>{allOrders.filter(order => matchesOrderFilter(order, value)).length}</span></button>)}
      </div>
      {checking && <OrderChecks key={checking.id} order={checking} busy={busy} mutate={mutate}
                                close={() => setCheckingId(null)}/>}
      <div className="panel-header">
        <h2>Recent orders</h2>
        <div className="row gap"><input aria-label="Search orders" placeholder="Search code, buyer or phone…"
                                        value={query} onChange={e => setQuery(e.target.value)}/><select
          aria-label="Filter orders" value={filter}
          onChange={e => setFilter(e.target.value)}>{['ALL', ...workflowOptions, 'ISSUES', ...issueOptions, 'AWAITING_DETAILS', 'AWAITING_PAYMENT', 'DEPOSIT_PAID', 'PAID', 'PAYMENT_REVIEW', 'EXPIRED', 'CANCELLED'].map(f =>
          <option key={f} value={f}>{checkLabels[f] ?? f.replaceAll('_', ' ')}</option>)}</select></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header}/>
                  )}
                </th>
              ))}
            </tr>
          ))}
          </thead>
          <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell}/>
                </td>
              ))}
            </tr>
          ))}
          {/*{orders.map((o: any) => <tr key={o.id}>
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
          )}*/}
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
      <div className="panel-footer">Latest 100 orders. Private checkout links grant access to that order; share only
        with its buyer.
      </div>
    </section>
  );
};

export default TabOrders;
