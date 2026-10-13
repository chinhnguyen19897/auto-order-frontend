"use client";
import {useEffect, useState, useCallback, type FormEvent} from 'react';
import {
  Radio,
  Package,
  ShoppingBag,
  Send,
  LogOut,
  ArrowUpRight,
  Plus,
  Check,
  Copy,
  RefreshCw,
  AlertCircle,
  Settings,
  CircleDollarSign,
  MessageSquare
} from 'lucide-react';
import {api, ApiError, money, type DashboardData, type Product, type Comment} from './api';

type Tab = 'live' | 'orders' | 'products' | 'notifications' | 'settings';
const navigation = [{id: 'live', label: 'Live workspace', icon: Radio}, {
  id: 'orders',
  label: 'Orders',
  icon: ShoppingBag
},
  {id: 'products', label: 'Products', icon: Package}, {
    id: 'notifications',
    label: 'Notifications',
    icon: Send
  }, {id: 'settings', label: 'Integrations', icon: Settings}] as const;

function Badge({value}: { value: string }) {
  return <span className={`badge ${value.toLowerCase()}`}>{value.replaceAll('_', ' ')}</span>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null), [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('live'), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('admin@example.com'), [password, setPassword] = useState('');
  const [selectedSession, setSelectedSession] = useState(''), [query, setQuery] = useState(''), [filter, setFilter] = useState('ALL');
  const [editing, setEditing] = useState<Product | 'new' | null>(null), [newSession, setNewSession] = useState(false), [reviewing, setReviewing] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState('A12 - 230k - 0901234567'), [buyerHandle, setBuyerHandle] = useState('buyer_one'), [buyerId, setBuyerId] = useState('10001');
  const refresh = useCallback(async () => {
    try {
      const result = await api<DashboardData>('admin/dashboard');
      setData(result);
      setSignedIn(true);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setSignedIn(false);
        setData(null);
      } else setError(e instanceof Error ? e.message : 'Unable to load dashboard.');
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 5000);
    return () => clearInterval(timer);
  }, [refresh]);
  const mutate = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
      await refresh();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed.');
      return false;
    } finally {
      setBusy(false);
    }
  };
  const activeSession = data?.sessions.find(s => s.id === selectedSession) ?? data?.sessions.find(s => s.status === 'ACTIVE');
  const comments = data?.comments.filter(c => !activeSession || c.sessionId === activeSession.id) ?? [];
  const orders = data?.orders.filter(o => (filter === 'ALL' || o.status === filter) && `${o.code} ${o.handle} ${o.phone} ${o.product.name}`.toLowerCase().includes(query.toLowerCase())) ?? [];

  async function login(e: FormEvent) {
    e.preventDefault();
    await mutate(() => api('auth/login', {email, password}), 'Signed in.');
    setPassword('');
  }

  async function simulate(e: FormEvent) {
    e.preventDefault();
    if (!activeSession) return;
    await mutate(() => api('admin/comments/demo', {
      sessionId: activeSession.id, eventId: crypto.randomUUID(), text: commentText, userId: buyerId,
      handle: buyerHandle, displayName: buyerHandle, occurredAt: new Date().toISOString()
    }), 'Comment processed.');
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setNotice('Private checkout link copied.');
    } catch {
      setError('Clipboard unavailable. Open the checkout link to copy it.');
    }
  }

  if (signedIn === null) return <main className="loading">Connecting to Auto Order…{error &&
      <p className="error">{error}</p>}</main>;
  if (!signedIn) return <main className="login">
    <div className="login-intro">
      <div className="brand"><span className="brand-mark"><Radio size={22}/></span> Auto Order</div>
      <span className="eyebrow">LESS ADMIN. MORE SELLING.</span><h1>Your live.<br/>Your orders.<br/><em>All
      together.</em></h1><p>A focused workspace that turns live comments into orders and keeps every payment in
      view.</p>
      <div className="login-pill"><span className="dot"/> Built for live commerce</div>
    </div>
    <form className="login-card" onSubmit={login}><span className="eyebrow">SELLER WORKSPACE</span><h2>Welcome back</h2>
      <p className="muted">Sign in to manage your next drop.</p>
      <label>Email<input type="email" autoComplete="username" required value={email}
                         onChange={e => setEmail(e.target.value)}/></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password}
                            onChange={e => setPassword(e.target.value)}/></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={busy} className="primary">{busy ? 'Signing in…' : 'Sign in'} <ArrowUpRight size={17}/></button>
      <p className="small muted">First run? Use the credentials generated in <code>backend/.env</code>.</p></form>
  </main>;
  if (!data) return <main className="loading">Loading orders…</main>;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Radio size={20}/></span>Auto Order</div>
      <p className="nav-label">WORKSPACE</p>
      <nav>{navigation.map(n => <button key={n.id} className={tab === n.id ? 'nav-item active' : 'nav-item'}
                                        onClick={() => setTab(n.id)}>
        <n.icon size={18}/>
        {n.label}{n.id === 'orders' && <span className="nav-count">{data.metrics.orders}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="connection-card"><span
          className="dot"/><strong>{data.config.demo ? 'Demo workspace' : 'Live workspace'}</strong>
          <p>{data.config.demo ? 'Try the flow before connecting providers.' : 'Check stream health while selling.'}</p>
        </div>
        <button className="nav-item" onClick={() => void mutate(() => api('auth/logout', {}), 'Signed out.')}><LogOut
          size={18}/>Sign out
        </button>
      </div>
    </aside>
    <div className="main-area">
      <header className="topbar"><span>Workspace <span
        className="muted"> / </span> {navigation.find(n => n.id === tab)?.label}</span>
        <div className="topbar-right"><span className="small muted">Updates every 5 seconds</span>
          <button className="icon-button" aria-label="Refresh dashboard" onClick={() => void refresh()}><RefreshCw
            size={17}/></button>
          <span className="avatar">AO</span></div>
      </header>
      <main className="content">
        <div className="page-title">
          <div><span className="eyebrow">LIVE COMMERCE, SIMPLIFIED</span>
            <h1>{tab === 'live' ? 'Your live workspace' : navigation.find(n => n.id === tab)?.label}</h1><p
              className="muted">{tab === 'live' ? 'Stay close to the conversation. We’ll keep track of the orders.' : 'Every detail you need, in one place.'}</p>
          </div>
          {tab === 'live' &&
              <button className="primary" onClick={() => setNewSession(true)}><Plus size={17}/>New session</button>}
          {tab === 'products' &&
              <button className="primary" onClick={() => setEditing('new')}><Plus size={17}/>Add product</button>}</div>
        {error && <div className="alert error" role="alert"><AlertCircle size={17}/>{error}
            <button onClick={() => setError('')}>Dismiss</button>
        </div>}
        {notice && <div className="alert success" role="status"><Check size={17}/>{notice}
            <button onClick={() => setNotice('')}>Dismiss</button>
        </div>}
        <div className="stats">{[{
          label: 'Orders captured',
          value: data.metrics.orders,
          icon: ShoppingBag
        }, {label: 'Order value', value: money(data.metrics.total), icon: CircleDollarSign},
          {label: 'Payments collected', value: money(data.metrics.collected), icon: Check}, {
            label: 'Needs review',
            value: data.metrics.review,
            icon: MessageSquare
          }].map(s => <div className="stat" key={s.label}>
          <div className="stat-top"><span>{s.label}</span>
            <s.icon size={18}/>
          </div>
          <strong>{s.value}</strong><span className="small muted">Across all sessions</span></div>)}</div>
        {tab === 'live' && <>
            <section className="session-banner">
                <div>
                    <div className="row gap"><span
                        className="dot"/><strong>{activeSession?.title || 'No active session'}</strong>{activeSession &&
                        <Badge value={activeSession.connectionStatus}/>}</div>
                    <p className="muted small">{activeSession ? `@${activeSession.username} · One item per order · 15-minute stock reservation` : 'Create a session to start capturing orders.'}</p>
                  {activeSession?.lastError && <p className="error small">{activeSession.lastError}</p>}
                  {activeSession?.heartbeatAt && Date.now() - new Date(activeSession.heartbeatAt).getTime() > 20000 &&
                      <p className="error small">Worker heartbeat is stale. Check the background worker.</p>}</div>
                <select aria-label="Select live session" value={activeSession?.id || ''}
                        onChange={e => setSelectedSession(e.target.value)}>
                    <option value="">Select session</option>
                  {data.sessions.map(s => <option key={s.id} value={s.id}>{s.title} ({s.status})</option>)}</select>
            </section>
            <div className="live-grid">
                <section className="panel">
                    <div className="panel-header"><h2>Live comments</h2><span
                        className="small muted">{comments.length} recent</span></div>
                    <div className="comment-feed">{comments.length === 0 &&
                        <div className="empty"><MessageSquare size={30}/><h3>Waiting for the first comment</h3>
                            <p>Connect a LIVE or use the demo simulator.</p></div>}{comments.map(c => <article
                      className="comment" key={c.id}><span
                      className="avatar light">{c.displayName.slice(0, 2).toUpperCase()}</span>
                      <div className="comment-body">
                        <div className="row spread"><strong>{c.displayName}</strong>
                          <time className="small muted">{new Date(c.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</time>
                        </div>
                        <span className="small muted">@{c.handle}</span><p>{c.text}</p>
                        <div className="row spread"><Badge
                          value={c.status}/>{['REVIEW', 'DUPLICATE'].includes(c.status) &&
                            <button className="text-button" onClick={() => setReviewing(c)}>Review <ArrowUpRight
                                size={14}/></button>}</div>
                        {c.reason && <p className="small muted">{c.reason}</p>}</div>
                    </article>)}</div>
                </section>
                <div className="right-panels">
                    <section className="panel">
                        <div className="panel-header"><h2>On the rack</h2><Package size={18}/></div>
                        <div className="panel-body"><label>Current product<select
                            disabled={!activeSession || busy || activeSession.status !== 'ACTIVE'}
                            value={activeSession?.currentProductId || ''}
                            onChange={e => activeSession && void mutate(() => api(`admin/sessions/${activeSession.id}`, {currentProductId: e.target.value || null}, 'PATCH'), 'Current product updated.')}>
                            <option value="">Require code / unique price</option>
                          {data.products.filter(p => p.active).map(p => <option key={p.id}
                                                                                value={p.id}>{p.sku} · {p.name}</option>)}
                        </select></label>
                          {data.products.find(p => p.id === activeSession?.currentProductId) && (() => {
                            const p = data.products.find(p => p.id === activeSession?.currentProductId)!;
                            return <div className="product-highlight"><span className="product-art"><Package size={38}/></span><strong>{p.name}</strong>
                              <div className="row spread"><span>{money(p.price)}</span><span
                                className="small muted">{p.stock} available</span></div>
                              <p className="small muted">Deposit {money(p.deposit)} · Code {p.sku}</p></div>;
                          })()}
                            <p className="small muted">Use a product code when several items share a
                                price.</p>{activeSession?.status === 'ACTIVE' &&
                                <button className="secondary full" disabled={busy}
                                        onClick={() => void mutate(() => api(`admin/sessions/${activeSession.id}`, {status: 'CLOSED'}, 'PATCH'), 'Session closed.')}>Close
                                    session</button>}</div>
                    </section>
                  {data.config.demo && <section className="panel">
                      <div className="panel-header"><h2>Comment simulator</h2><Badge value="DEMO"/></div>
                      <form className="panel-body" onSubmit={simulate}><label>TikTok handle<input value={buyerHandle}
                                                                                                  required
                                                                                                  onChange={e => setBuyerHandle(e.target.value)}/></label><label>Numeric
                          TikTok user ID<input value={buyerId} required pattern="[0-9]+"
                                               onChange={e => setBuyerId(e.target.value)}/></label><label>Comment<textarea
                          rows={3} value={commentText} required onChange={e => setCommentText(e.target.value)}/></label>
                          <button disabled={busy || !activeSession || activeSession.status !== 'ACTIVE'}
                                  className="primary full"><Send size={16}/>Process comment
                          </button>
                          <p className="small muted">No message or money is sent in demo mode.</p></form>
                  </section>}</div>
            </div>
        </>}
        {tab === 'orders' && <section className="panel">
            <div className="panel-header"><h2>Recent orders</h2>
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
                    <tbody>{orders.map(o => <tr key={o.id}>
                      <td><strong>{o.code}</strong><p>{o.customerName || o.displayName}</p><span
                        className="small muted">@{o.handle} · {o.phone}</span></td>
                      <td>{o.product.name}<p className="small muted">{o.product.sku}</p></td>
                      <td><strong>{money(o.total)}</strong><p className="small muted">{money(o.amountPaid)} received</p>
                      </td>
                      <td><Badge value={o.status}/>{o.payments.some(p => ['RECONCILE', 'REVIEW'].includes(p.status)) &&
                          <p className="error small">Payment reconciliation needed</p>}</td>
                      <td>
                        <div className="row gap wrap"><a className="icon-button" title="Open private checkout"
                                                         href={o.checkoutUrl} target="_blank"
                                                         rel="noreferrer"><ArrowUpRight size={16}/></a>
                          <button className="icon-button" title="Copy checkout link"
                                  onClick={() => void copyLink(o.checkoutUrl)}><Copy size={16}/></button>
                          <>{o.payments.filter(p => ['CREATING', 'RECONCILE'].includes(p.status)).map(p => <button
                            key={p.id} className="text-button danger" disabled={busy} onClick={() => {
                            if (window.confirm('Check the provider and close any unpaid link? The buyer can create a new QR afterward.')) void mutate(() => api(`admin/payments/${p.id}/reconcile`, {}), 'Payment checked. Review the updated order status.');
                          }}>Reconcile</button>)}</>
                          <button className="text-button" disabled={busy || ['EXPIRED', 'CANCELLED'].includes(o.status)}
                                  onClick={() => void mutate(() => api(`admin/orders/${o.id}/notify`, {}), 'Notification queued.')}>Resend
                          </button>
                          {o.amountPaid === 0 && ['AWAITING_DETAILS', 'AWAITING_PAYMENT'].includes(o.status) &&
                              <button className="text-button danger" disabled={busy} onClick={() => {
                                if (window.confirm(`Cancel ${o.code} and release its stock?`)) void mutate(() => api(`admin/orders/${o.id}/cancel`, {}), 'Order cancelled.');
                              }}>Cancel</button>}</div>
                      </td>
                    </tr>)}</tbody>
                </table>
              {orders.length === 0 && <div className="empty"><ShoppingBag size={28}/><p>No matching orders.</p></div>}
            </div>
            <div className="panel-footer">Latest 100 orders. Private checkout links grant access to that order; share
                only with its buyer.
            </div>
        </section>}
        {tab === 'products' &&
            <div className="product-grid">{data.products.map(p => <section className="panel product-card" key={p.id}>
              <div className="product-visual"><Package size={55}/><span>{p.sku}</span></div>
              <div className="panel-body">
                <div className="row spread"><h2>{p.name}</h2><Badge value={p.active ? 'ACTIVE' : 'INACTIVE'}/></div>
                <strong className="price">{money(p.price)}</strong><p
                className="muted small">Deposit {money(p.deposit)} · {p.stock} units available</p>
                <button className="secondary full" onClick={() => setEditing(p)}>Edit product</button>
              </div>
            </section>)}{data.products.length === 0 &&
                <div className="empty">Add your first product to start.</div>}</div>}
        {tab === 'notifications' && <section className="panel">
            <div className="panel-header"><h2>Delivery outbox</h2><span
                className="small muted">Retries automatically</span></div>
            <div className="table-wrap">
                <table>
                    <thead>
                    <tr>
                        <th>Order</th>
                        <th>Channel</th>
                        <th>Status</th>
                        <th>Attempts</th>
                        <th>Detail</th>
                    </tr>
                    </thead>
                    <tbody>{data.notifications.map(n => <tr key={n.id}>
                      <td>{data.orders.find(o => o.id === n.orderId)?.code || n.orderId}</td>
                      <td>{n.channel}</td>
                      <td><Badge value={n.status}/></td>
                      <td>{n.attempts}</td>
                      <td
                        className="small muted">{n.lastError || (n.status === 'DEMO' ? 'Simulated; nothing sent to the buyer.' : '—')}</td>
                    </tr>)}</tbody>
                </table>
              {data.notifications.length === 0 && <div className="empty">No notifications yet.</div>}</div>
        </section>}
        {tab === 'settings' && <>
            <section className="panel">
                <div className="panel-header"><h2>Integration status</h2></div>
                <div className="panel-body integration-grid">
                    <article><Radio/><h3>TikTok LIVE</h3><Badge value={data.config.demo ? 'DEMO' : 'LIVE'}/><p
                        className="muted">Persistent worker receives comments using the unofficial TikTok connector.
                        Monitor connection health for every session.</p></article>
                    <article><CircleDollarSign/><h3>Banking QR</h3><Badge value={data.config.paymentProvider}/><p
                        className="muted">Configure payOS credentials on the backend. Payment is confirmed by a verified
                        webhook.</p></article>
                    <article><Send/><h3>Zalo / SMS</h3><Badge value={data.config.notificationProvider}/><p
                        className="muted">Connect an approved messaging gateway. Demo notifications stay in this
                        workspace.</p></article>
                </div>
                <div className="panel-footer">Configure server integrations in backend/.env. See
                    backend/docs/INTEGRATIONS.md. Credentials are never sent to the browser.
                </div>
            </section>
          {data.unmatchedReceipts.length > 0 && <section className="panel" style={{marginTop: 22}}>
              <div className="panel-header"><h2>Unmatched bank receipts</h2><Badge value="REVIEW"/></div>
              <div className="table-wrap">
                  <table>
                      <thead>
                      <tr>
                          <th>Reference</th>
                          <th>Provider order code</th>
                          <th>Amount</th>
                      </tr>
                      </thead>
                      <tbody>{data.unmatchedReceipts.map(r => <tr key={r.id}>
                        <td>{r.reference}</td>
                        <td>{r.orderCode}</td>
                        <td>{money(r.amount)}</td>
                      </tr>)}</tbody>
                  </table>
              </div>
              <div className="panel-footer">Signed receipts without a matching local payment are retained here. Check
                  these in provider/bank records; registration-test receipts may also appear.
              </div>
          </section>}</>}
      </main>
    </div>
    {editing && <Modal title={editing === 'new' ? 'Add product' : 'Edit product'} onClose={() => setEditing(null)}>
        <form onSubmit={async e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const body = {
            sku: String(f.get('sku')).toUpperCase(),
            name: f.get('name'),
            price: Number(f.get('price')),
            deposit: Number(f.get('deposit')),
            stock: Number(f.get('stock')),
            active: f.get('active') === 'on', ...(editing === 'new' ? {} : {expectedVersion: editing.version})
          };
          if (await mutate(() => api(editing === 'new' ? 'admin/products' : `admin/products/${editing.id}`, body, editing === 'new' ? 'POST' : 'PATCH'), 'Product saved.')) setEditing(null);
        }}><label>Product code<input name="sku" required pattern="[A-Za-z]{1,8}[0-9]{1,8}"
                                     defaultValue={editing === 'new' ? '' : editing.sku}
                                     placeholder="A12"/></label><label>Name<input name="name" required minLength={2}
                                                                                  defaultValue={editing === 'new' ? '' : editing.name}/></label>
            <div className="form-grid"><label>Price (VND)<input name="price" type="number" required min={1000}
                                                                defaultValue={editing === 'new' ? 230000 : editing.price}/></label><label>Deposit
                (VND)<input name="deposit" type="number" required min={1000}
                            defaultValue={editing === 'new' ? 50000 : editing.deposit}/></label></div>
            <label>Available stock<input name="stock" type="number" required min={0}
                                         defaultValue={editing === 'new' ? 1 : editing.stock}/></label><label
                className="checkbox"><input name="active" type="checkbox"
                                            defaultChecked={editing === 'new' || editing.active}/>Available for
                sale</label><p className="small muted">Stock means currently available units, excluding reserved/sold
                units.</p>
            <button className="primary full" disabled={busy}>Save product</button>
        </form>
    </Modal>}
    {newSession && <Modal title="Create live session" onClose={() => setNewSession(false)}>
        <form onSubmit={async e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (await mutate(() => api('admin/sessions', {
            title: f.get('title'),
            username: String(f.get('username')).replace(/^@/, ''),
            currentProductId: f.get('productId') || null
          }), 'Session created.')) setNewSession(false);
        }}><label>Session title<input name="title" required minLength={2}
                                      placeholder="Evening vintage drop"/></label><label>TikTok creator username<input
            name="username" required placeholder="your_shop"/></label><label>Current product<select name="productId">
            <option value="">Require code / unique price</option>
          {data.products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.sku} · {p.name}</option>)}
        </select></label>
            <button disabled={busy} className="primary full">Create session</button>
        </form>
    </Modal>}
    {reviewing &&
        <Modal title="Review comment" onClose={() => setReviewing(null)}><p className="quote">{reviewing.text}</p><p
            className="muted small">{reviewing.reason}</p>
            <form onSubmit={async e => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              if (await mutate(() => api(`admin/comments/${reviewing.id}/resolve`, {
                productId: f.get('productId'),
                phone: f.get('phone')
              }), 'Comment resolved. Check the order or review status.')) setReviewing(null);
            }}><label>Confirmed product<select name="productId" required>
                <option value="">Choose product</option>
              {data.products.filter(p => p.active).map(p => <option key={p.id}
                                                                    value={p.id}>{p.sku} · {p.name} · {money(p.price)}</option>)}
            </select></label><label>Confirmed buyer phone<input name="phone" required placeholder="0901234567"/></label>
                <p className="small muted">Confirm buyer intent before creating an additional order from a duplicate
                    comment.</p>
                <button disabled={busy} className="primary full">Create confirmed draft</button>
                <button type="button" disabled={busy} className="secondary full"
                        onClick={() => void mutate(() => api(`admin/comments/${reviewing.id}/ignore`, {}), 'Comment dismissed.').then(ok => ok && setReviewing(null))}>Dismiss
                    comment
                </button>
            </form>
        </Modal>}
  </div>;
}

function Modal({title, onClose, children}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onClick={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
      <div className="panel-header"><h2>{title}</h2>
        <button onClick={onClose} aria-label="Close dialog" className="icon-button">×</button>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  </div>;
}
