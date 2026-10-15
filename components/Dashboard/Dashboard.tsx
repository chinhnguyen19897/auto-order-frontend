"use client";
import {useEffect, useState, useCallback, SyntheticEvent} from 'react';
import {
  ShoppingBag,
  Plus,
  Check,
  RefreshCw,
  AlertCircle,
  CircleDollarSign,
  MessageSquare
} from 'lucide-react';
import {api, ApiError} from '../../lib/api';
import {navigation, Sidebar} from "../Sidebar/Sidebar";
import {ModalCommon} from "../Modal/ModalCommon";
import {Tab} from "../../types/tabs";
import Login from "../Login/login";
import Loading from "../Loading/Loading";
import TabOrders from "../MenuTabs/TabOrders/TabOrders";
import TabSessionLive from "../MenuTabs/TabSessionLive/TabSessionLive";
import Products from "../Products/Products";
import Notifications from "../Notifications/Notifications";
import Settings from "../Settings/Settings";
import {money} from "../../utils/currency";
import {DashboardData, Product, Comment} from "../../types/common";


export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab | string>('live')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('');
  const [selectedSession, setSelectedSession] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL');
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [newSession, setNewSession] = useState(false)
  const [reviewing, setReviewing] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState('A12 - 230k - 0901234567')
  const [buyerHandle, setBuyerHandle] = useState('buyer_one')
  const [buyerId, setBuyerId] = useState('10001');

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

  const orderStats = [
    {
      label: 'Orders captured',
      value: data?.metrics.orders,
      icon: ShoppingBag
    },
    {
      label: 'Order value',
      value: money(data?.metrics.total as number),
      icon: CircleDollarSign
    },
    {
      label: 'Payments collected',
      value: money(data?.metrics.collected as number),
      icon: Check
    },
    {
      label: 'Needs review',
      value: data?.metrics.review,
      icon: MessageSquare
    }
  ]


  async function login(e: SyntheticEvent) {
    e.preventDefault();
    await mutate(() => api('auth/login', {email, password}), 'Signed in.');
    setPassword('');
  }

  async function simulate(e: SyntheticEvent) {
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

  const submitEditProduct = async (e: any, editing?: Product | 'new') => {
    e.preventDefault();
    if (!editing) return;
    const f = new FormData(e.currentTarget);
    const body = {
      sku: String(f.get('sku')).toUpperCase(),
      name: f.get('name'),
      price: Number(f.get('price')),
      deposit: Number(f.get('deposit')),
      stock: Number(f.get('stock')),
      active: f.get('active') === 'on', ...(editing === 'new' ? {} : {expectedVersion: editing?.version})
    };
    const checkEdit = await mutate(() => api(editing === 'new' ? 'admin/products' : `admin/products/${editing?.id}`, body, editing === 'new' ? 'POST' : 'PATCH'), 'Product saved.')

    if (checkEdit) setEditing(null);
  }

  const createNewSession = async (e: any) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (await mutate(() => api('admin/sessions', {
      title: f.get('title'),
      username: String(f.get('username')).replace(/^@/, ''),
      currentProductId: f.get('productId') || null
    }), 'Session created.')) setNewSession(false);
  }

  const createReviewing = async (e: any, reviewing: Comment | null) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const checkReview = await mutate(() => api(`admin/comments/${reviewing?.id}/resolve`, {
      productId: f.get('productId'),
      phone: f.get('phone')
    }), 'Comment resolved. Check the order or review status.')

    if (checkReview) setReviewing(null);
  }

  if (signedIn === null) return <Loading text={"Connecting to Auto Order…"} error={error}/>

  if (!signedIn) return <Login login={login} busy={busy} email={email} setEmail={setEmail} error={error}
                               password={password} setPassword={setPassword}/>

  if (!data) return <Loading text={"Loading order"}/>


  return <div className="app-shell">
    <Sidebar data={data} logout={mutate} tab={tab} setTab={setTab}/>
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
            <h1>{tab === 'live' ? 'Your live workspace' : navigation.find(n => n.id === tab)?.label}</h1>
            <p
              className="muted">{tab === 'live' ? 'Stay close to the conversation. We’ll keep track of the orders.' : 'Every detail you need, in one place.'}</p>
          </div>
          {tab === 'live' &&
              <button className="primary" onClick={() => setNewSession(true)}><Plus size={17}/>New session</button>}
          {tab === 'products' &&
              <button className="primary" onClick={() => setEditing('new')}><Plus size={17}/>Add product</button>}
        </div>
        {error && <div className="alert error" role="alert">
            <AlertCircle size={17}/>{error}
            <button onClick={() => setError('')}>Dismiss</button>
        </div>}
        {notice && <div className="alert success" role="status">
            <Check size={17}/>{notice}
            <button onClick={() => setNotice('')}>Dismiss</button>
        </div>}
        <div className="stats">
          {
            orderStats.map(s =>
              <div className="stat" key={s.label}>
                <div className="stat-top"><span>{s.label}</span>
                  <s.icon size={18}/>
                </div>
                <strong>{s.value}</strong>
                <span className="small muted">Across all sessions</span>
              </div>
            )
          }
        </div>
        {tab === 'live' && <TabSessionLive activeSession={activeSession} busy={busy} data={data} buyerId={buyerId}
                                           setBuyerId={setBuyerId} setBuyerHandle={setBuyerHandle}
                                           buyerHandle={buyerHandle} commentText={commentText}
                                           setCommentText={setCommentText} comments={comments} simulate={simulate}
                                           mutate={mutate} setSelectedSession={setSelectedSession}
                                           setReviewing={setReviewing}/>}
        {tab === 'orders' &&
            <TabOrders query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} orders={orders}
                       busy={busy} mutate={mutate} copyLink={copyLink}/>}

        {tab === 'products' && <Products data={data} editProduct={setEditing}/>}

        {tab === 'notifications' && <Notifications data={data}/>}

        {tab === 'settings' && <Settings data={data}/>}
      </main>
    </div>
    {editing &&
        <ModalCommon title={editing === 'new' ? 'Add product' : 'Edit product'} onClose={() => setEditing(null)}>
            <form onSubmit={(e) => submitEditProduct(e, editing)}>
                <label>Product code<input name="sku" required pattern="[A-Za-z]{1,8}[0-9]{1,8}"
                                          defaultValue={editing === 'new' ? '' : editing.sku}
                                          placeholder="A12"/>
                </label>
                <label>Name<input name="name" required minLength={2}
                                  defaultValue={editing === 'new' ? '' : editing.name}/>
                </label>
                <div className="form-grid">
                    <label>Price (VND)<input name="price" type="number" required min={1000}
                                             defaultValue={editing === 'new' ? 230000 : editing.price}/>
                    </label>
                    <label>Deposit (VND)<input name="deposit" type="number" required min={1000}
                                               defaultValue={editing === 'new' ? 50000 : editing.deposit}/>
                    </label>
                </div>
                <label>Available stock<input name="stock" type="number" required min={0}
                                             defaultValue={editing === 'new' ? 1 : editing.stock}/>
                </label>
                <label className="checkbox"><input name="active" type="checkbox"
                                                   defaultChecked={editing === 'new' || editing.active}/>Available for
                    sale
                </label>
                <p className="small muted">Stock means currently available units, excluding reserved/sold units.</p>
                <button className="primary full" disabled={busy}>Save product</button>
            </form>
        </ModalCommon>
    }
    {newSession &&
        <ModalCommon title="Create live session" onClose={() => setNewSession(false)}>
            <form onSubmit={createNewSession}>
                <label>Session title<input name="title" required minLength={2} placeholder="Evening vintage drop"/>
                </label>
                <label>TikTok creator username<input name="username" required placeholder="your_shop"/>
                </label>
                <label>Current product<select name="productId">
                    <option value="">Require code / unique price</option>
                  {data.products.filter(p => p.active).map(p => <option key={p.id}
                                                                        value={p.id}>{p.sku} · {p.name}</option>)}
                </select>
                </label>
                <button disabled={busy} className="primary full">Create session</button>
            </form>
        </ModalCommon>}
    {reviewing &&
        <ModalCommon title="Review comment" onClose={() => setReviewing(null)}>
            <p className="quote">{reviewing.text}</p>
            <p className="muted small">{reviewing.reason}</p>
            <form onSubmit={(e) => createReviewing(e, reviewing)}>
                <label>Confirmed product
                    <select name="productId" required>
                        <option value="">Choose product</option>
                      {data.products.filter(p => p.active).map(p => <option key={p.id}
                                                                            value={p.id}>{p.sku} · {p.name} · {money(p.price)}</option>)}
                    </select>
                </label>
                <label>Confirmed buyer phone<input name="phone" required placeholder="0901234567"/>
                </label>
                <p className="small muted">Confirm buyer intent before creating an additional order from a duplicate
                    comment.</p>
                <button disabled={busy} className="primary full">Create confirmed draft</button>
                <button type="button" disabled={busy} className="secondary full"
                        onClick={() => void mutate(() => api(`admin/comments/${reviewing.id}/ignore`, {}), 'Comment dismissed.').then(ok => ok && setReviewing(null))}>
                    Dismiss comment
                </button>
            </form>
        </ModalCommon>}
  </div>;
}


