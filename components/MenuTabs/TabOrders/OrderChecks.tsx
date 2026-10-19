import {useState, type FormEvent} from 'react';
import type {Order} from '../../../types/common';
import {api} from '../../../lib/api';
import {checkLabels, workflowOptions, issueOptions} from '../../../lib/order-checks';

export default function OrderChecks({order, busy, mutate, close}: {
  order: Order; busy: boolean; close: () => void;
  mutate: (action: () => Promise<unknown>, success: string) => Promise<any>;
}) {
  const [workflowStatus, setWorkflowStatus] = useState(order.workflowStatus);
  const [zaloContact, setZaloContact] = useState(order.zaloContact ?? '');
  const [issues, setIssues] = useState(order.issues);
  const [issueNote, setIssueNote] = useState(order.issueNote ?? '');
  async function save(event: FormEvent) {
    event.preventDefault();
    if (await mutate(() => api(`admin/orders/${order.id}/checks`, {
      workflowStatus, zaloContact: zaloContact.trim() || null, issues, issueNote: issueNote.trim() || null
    }, 'PATCH'), 'Order checks updated.')) close();
  }
  return <form className="order-check-editor" onSubmit={save}>
    <div className="row between gap wrap"><h3>Check {order.code}</h3><button type="button" className="text-button" disabled={busy} onClick={close}>Close</button></div>
    <p className="small muted">Match the buyer’s Zalo contact, review customer details, and resolve issues before marking ready.</p>
    <div className="order-check-fields">
      <label>Zalo contact<input value={zaloContact} maxLength={200} placeholder="Zalo name, phone or profile link" onChange={e => {
        setZaloContact(e.target.value);
        if (workflowStatus === 'NEEDS_MATCHING' && e.target.value.trim()) setWorkflowStatus('ZALO_MATCHED');
      }}/></label>
      <label>Order check status<select value={workflowStatus} onChange={e => setWorkflowStatus(e.target.value)}>
        {workflowOptions.map(value => <option key={value} value={value}>{checkLabels[value]}</option>)}
      </select></label>
    </div>
    <p className="small">Customer: {order.customerName || 'Missing name'} · {order.phone || 'Missing phone'} · {order.address || 'Missing address'}</p>
    <p className="small muted">Customer details are completed through the private checkout link. Missing details and payment reviews clear automatically once resolved.</p>
    {order.checkIssues.length > 0 && <p className="error small">Current issues: {order.checkIssues.map(code => checkLabels[code] ?? code).join(', ')}</p>}
    <fieldset disabled={busy}><legend>Flagged issues</legend><div className="row gap wrap">
      {issueOptions.map(code => <label className="order-issue-option" key={code}><input type="checkbox" checked={issues.includes(code)} onChange={e => setIssues(e.target.checked ? [...issues, code] : issues.filter(value => value !== code))}/>{checkLabels[code]}</label>)}
    </div></fieldset>
    <label>Issue note<textarea value={issueNote} maxLength={1000} onChange={e => setIssueNote(e.target.value)} placeholder="What needs checking or fixing?"/></label>
    <button className="primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save checks'}</button>
  </form>;
}
