import React from 'react';
import {Badge} from "../Badge/Badge";

type NotificationsProps = {
  data?: any
}
const Notifications = ({data}: NotificationsProps) => {
  return (
    <section className="panel">
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
          <tbody>{data.notifications.map((n: any) => <tr key={n.id}>
            <td>{data.orders.find((o: any) => o.id === n.orderId)?.code || n.orderId}</td>
            <td>{n.channel}</td>
            <td><Badge value={n.status}/></td>
            <td>{n.attempts}</td>
            <td
              className="small muted">{n.lastError || (n.status === 'DEMO' ? 'Simulated; nothing sent to the buyer.' : '—')}</td>
          </tr>)}</tbody>
        </table>
        {data.notifications.length === 0 && <div className="empty">No notifications yet.</div>}</div>
    </section>
  );
};

export default Notifications;