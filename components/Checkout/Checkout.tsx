"use client";
import {useState, useEffect, useCallback, type FormEvent} from 'react';
import {Check, Radio, LockKeyhole, Package, ArrowRight, CircleDollarSign} from 'lucide-react';
import {api} from '../../lib/api';
import {money} from "../../utils/currency";
import {CheckoutData} from "../../types/common";

export default function Checkout({token}: { token: string }) {
  const [order, setOrder] = useState<CheckoutData | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try {
      setOrder(await api<CheckoutData>(`checkout/${token}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load order.');
    }
  }, [token]);
  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function action(path: string, body: unknown) {
    setBusy(true);
    setError('');
    try {
      setOrder(await api<CheckoutData>(`checkout/${token}/${path}`, body));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void action('details', {
      customerName: form.get('customerName'),
      phone: form.get('phone'),
      address: form.get('address'),
      consent: form.get('consent') === 'on'
    });
  }

  const blocked = order && ['EXPIRED', 'CANCELLED', 'PAYMENT_REVIEW'].includes(order.status);
  return <main className="checkout-page">
    <header className="checkout-header">
      <div className="brand"><span className="brand-mark"><Radio size={20}/></span>Auto Order</div>
      <span className="small muted"><LockKeyhole size={14}/>Private checkout</span></header>
    <div className="checkout-heading"><span className="eyebrow">YOUR LIVE FIND, RESERVED</span><h1>Make it yours.</h1><p
      className="muted">Confirm your delivery details and complete your payment.</p></div>
    {error && <div className="alert error" role="alert">{error}</div>}
    {!order ? <div
        className="panel panel-body">{error ? 'Contact the seller for a valid order link.' : 'Loading your order…'}</div> :
      <div className="checkout-grid">
        <section className="panel">
          <div className="panel-header"><h2><Package size={18}/> Order summary</h2><span
            className="small muted">{order.code}</span></div>
          <div className="panel-body">
            <div className="checkout-product">
              <div className="product-art"><Package size={35}/></div>
              <div><strong>{order.product.name}</strong><p className="muted small">{order.product.sku} · Quantity 1</p>
              </div>
            </div>
            <div className="summary-line"><span>Product total</span><strong>{money(order.total)}</strong></div>
            <div className="summary-line"><span>Required deposit</span><strong>{money(order.deposit)}</strong></div>
            <div className="summary-line"><span>Received</span><strong>{money(order.amountPaid)}</strong></div>
            <div className="summary-line total">
              <span>Balance</span><strong>{money(Math.max(0, order.total - order.amountPaid))}</strong></div>
            <p className="small muted">Delivery charges, if any, are confirmed by the seller separately.</p><span
            className={`badge ${order.status.toLowerCase()}`}>{order.status.replaceAll('_', ' ')}</span>
            {order.amountPaid === 0 && !blocked &&
                <p className="small muted">Reserved until {new Date(order.reservedUntil).toLocaleString()}. Contact the
                    seller if the reservation expires.</p>}
            {order.demo &&
                <div className="demo-note">Demo order: QR codes are test data. Do not transfer real money.</div>}</div>
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>{order.status === 'AWAITING_DETAILS' ? '1. Delivery details' : '2. Payment'}</h2><LockKeyhole
            size={17}/></div>
          <div className="panel-body">
            {blocked ? <div className="empty">
              <h3>{order.status === 'PAYMENT_REVIEW' ? 'Payment needs review' : 'This reservation is closed'}</h3>
              <p>Contact the seller. Please do not send another transfer.</p></div> : order.status === 'PAID' ?
              <div className="paid-state"><span><Check size={32}/></span><h2>Payment received</h2><p>Your order is
                confirmed. The seller will arrange delivery.</p></div> : order.status === 'AWAITING_DETAILS' ?
                <form onSubmit={submit}><label>Full name<input name="customerName" required minLength={2}
                                                               autoComplete="name"
                                                               defaultValue={order.customerName || ''}/></label><label>Phone
                  number<input name="phone" required type="tel" autoComplete="tel"
                               placeholder={order.phoneHint}/></label><p className="small muted">Use the same phone
                  number as your LIVE comment.</p><label>Delivery address<textarea name="address" required
                                                                                   minLength={10} rows={3}
                                                                                   autoComplete="street-address"
                                                                                   defaultValue={order.address || ''}/></label><label
                  className="checkbox"><input name="consent" required type="checkbox"/>I confirm this order and allow
                  the seller to use these details to contact me and deliver it.</label>
                  <button disabled={busy} className="primary full">Confirm details <ArrowRight size={17}/></button>
                </form> : <>
                  <p className="muted small">Deliver to {order.customerName}: {order.address}</p>
                  {order.status === 'DEPOSIT_PAID' &&
                      <div className="alert success"><Check size={17}/>Deposit received. Your item remains reserved.
                      </div>}
                  {order.payment ?
                    <div className="qr-section"><p>Amount to pay <strong>{money(order.payment.amount)}</strong></p><img
                      src={order.payment.qrImage} width={260} height={260}
                      alt={order.demo ? 'Demo code, not a bank transfer QR' : 'Bank transfer QR code'}/><p
                      className="small muted">Expires {new Date(order.payment.expiresAt).toLocaleTimeString()}</p>{order.payment.checkoutUrl &&
                        <a className="primary full" href={order.payment.checkoutUrl} target="_blank" rel="noreferrer">Open
                            banking payment <ArrowRight size={16}/></a>}{order.demo &&
                        <button disabled={busy} className="primary full"
                                onClick={() => void action('demo-pay', {})}>Simulate successful payment</button>}<p
                      className="small muted">Payment status updates automatically after the bank confirms receipt.</p>
                    </div> : <div className="payment-options">
                      <button disabled={busy || order.amountPaid >= order.deposit} className="secondary full"
                              onClick={() => void action('payment', {kind: 'deposit'})}><CircleDollarSign size={18}/>Pay
                        deposit · {money(Math.max(0, order.deposit - order.amountPaid))}</button>
                      <button disabled={busy} className="primary full"
                              onClick={() => void action('payment', {kind: 'full'})}>Pay {order.amountPaid ? 'remaining balance' : 'in full'} · {money(Math.max(0, order.total - order.amountPaid))}</button>
                    </div>}</>}
          </div>
        </section>
      </div>}
    <footer className="checkout-footer">Keep this link private. It gives access to your order.</footer>
  </main>;
}
