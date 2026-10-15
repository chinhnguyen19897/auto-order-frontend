import React from 'react';
import {Badge} from "../../Badge/Badge";
import {ArrowUpRight, MessageSquare, Package, Send} from "lucide-react";
import {api, money} from "../../api";

type TabSessionLiveProps = {
  activeSession: any
  data: any
  comments: any
  setReviewing: any
  simulate: any
  buyerHandle: any
  setBuyerHandle: any
  buyerId: any
  setBuyerId: any
  commentText: any
  setCommentText: any
  setSelectedSession: any
  mutate: any
  busy: any
}


const TabSessionLive = ({
                          activeSession,
                          data,
                          comments,
                          setReviewing,
                          simulate,
                          buyerHandle,
                          setBuyerHandle,
                          buyerId,
                          setBuyerId,
                          commentText,
                          setCommentText,
                          setSelectedSession,
                          mutate,
                          busy
                        }: TabSessionLiveProps) => {
  return (
    <>
      <section className="session-banner">
        <div>
          <div className="row gap"><span
            className="dot"/><strong>{activeSession?.title || 'No active session'}</strong>
            {
              activeSession && <Badge value={activeSession.connectionStatus}/>
            }
          </div>
          <p className="muted small">
            {activeSession ? `@${activeSession.username} · One item per order · 15-minute stock reservation` : 'Create a session to start capturing orders.'}
          </p>
          {
            activeSession?.lastError && <p className="error small">{activeSession.lastError}</p>
          }
          {
            activeSession?.heartbeatAt && Date.now() - new Date(activeSession.heartbeatAt).getTime() > 20000 &&
              <p className="error small">Worker heartbeat is stale. Check the background worker.</p>
          }
        </div>
        <select aria-label="Select live session" value={activeSession?.id || ''}
                onChange={e => setSelectedSession(e.target.value)}>
          <option value="">Select session</option>
          {
            data.sessions.map((s: any) => <option key={s.id} value={s.id}>{s.title} ({s.status})</option>)
          }
        </select>
      </section>
      <div className="live-grid">
        <section className="panel">
          <div className="panel-header"><h2>Live comments</h2>
            <span className="small muted">{comments.length} recent</span></div>
          <div className="comment-feed">
            {comments.length === 0 &&
                <div className="empty">
                    <MessageSquare size={30}/>
                    <h3>Waiting for the first comment</h3>
                    <p>Connect a LIVE or use the demo simulator.</p>
                </div>
            }
            {comments.map((c: any) => <article className="comment" key={c.id}>
              <span className="avatar light">{c.displayName.slice(0, 2).toUpperCase()}</span>
              <div className="comment-body">
                <div className="row spread"><strong>{c.displayName}</strong>
                  <time className="small muted">{new Date(c.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</time>
                </div>
                <span className="small muted">@{c.handle}</span><p>{c.text}</p>
                <div className="row spread">
                  <Badge
                    value={c.status}/>
                  {['REVIEW', 'DUPLICATE'].includes(c.status) &&
                      <button className="text-button" onClick={() => setReviewing(c)}>Review <ArrowUpRight
                          size={14}/>
                      </button>
                  }
                </div>
                {c.reason && <p className="small muted">{c.reason}</p>}
              </div>
            </article>)}
          </div>
        </section>
        <div className="right-panels">
          <section className="panel">
            <div className="panel-header">
              <h2>On the rack</h2>
              <Package size={18}/>
            </div>
            <div className="panel-body">
              <label>
                Current product
                <select disabled={!activeSession || busy || activeSession.status !== 'ACTIVE'}
                        value={activeSession?.currentProductId || ''}
                        onChange={e => activeSession && void mutate(() => api(`admin/sessions/${activeSession.id}`, {currentProductId: e.target.value || null}, 'PATCH'), 'Current product updated.')}>
                  <option value="">Require code / unique price</option>
                  {data.products.filter((p: any) => p.active).map((p: any) => <option key={p.id}
                                                                        value={p.id}>{p.sku} · {p.name}</option>)}
                </select>
              </label>
              {data.products.find((p: any) => p.id === activeSession?.currentProductId) && (() => {
                const p = data.products.find((p: any) => p.id === activeSession?.currentProductId)!;
                return <div className="product-highlight">
                  <span className="product-art">
                    <Package size={38}/>
                  </span><strong>{p.name}</strong>
                  <div className="row spread">
                    <span>{money(p.price)}</span>
                    <span className="small muted">{p.stock} available</span>
                  </div>
                  <p className="small muted">Deposit {money(p.deposit)} · Code {p.sku}</p>
                </div>;
              })()}
              <p className="small muted">Use a product code when several items share a
                price.</p>{activeSession?.status === 'ACTIVE' &&
                <button className="secondary full" disabled={busy}
                        onClick={() => void mutate(() => api(`admin/sessions/${activeSession.id}`, {status: 'CLOSED'}, 'PATCH'), 'Session closed.')}>Close
                    session</button>}</div>
          </section>
          {
            data.config.demo && <section className="panel">
                  <div className="panel-header">
                      <h2>Comment simulator</h2>
                      <Badge value="DEMO"/>
                  </div>
                  <form className="panel-body" onSubmit={simulate}>
                      <label>
                          TikTok handle <input value={buyerHandle} required onChange={e => setBuyerHandle(e.target.value)}/>
                      </label>
                      <label>
                          Numeric TikTok user ID <input value={buyerId} required pattern="[0-9]+"
                                                        onChange={e => setBuyerId(e.target.value)}/>
                      </label>
                      <label>Comment
                          <textarea rows={3} value={commentText} required onChange={e => setCommentText(e.target.value)}/>
                      </label>
                      <button disabled={busy || !activeSession || activeSession.status !== 'ACTIVE'}
                              className="primary full">
                          <Send size={16}/> Process comment
                      </button>
                      <p className="small muted">No message or money is sent in demo mode.</p>
                  </form>
              </section>
          }
        </div>
      </div>
    </>
  );
};

export default TabSessionLive;