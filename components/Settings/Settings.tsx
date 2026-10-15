import React from 'react';
import {CircleDollarSign, Radio, Send} from "lucide-react";
import {Badge} from "../Badge/Badge";
import {money} from "../api";

type SettingsProps = {
  data?: any
}
const Settings = ({data}: SettingsProps) => {
  return (
    <>
      <section className="panel">
        <div className="panel-header"><h2>Integration status</h2></div>
        <div className="panel-body integration-grid">
          <article>
            <Radio/>
            <h3>TikTok LIVE</h3>
            <Badge value={data.config.demo ? 'DEMO' : 'LIVE'}/>
            <p className="muted">
              Persistent worker receives comments using the unofficial TikTok connector.
              Monitor connection health for every session.
            </p>
          </article>
          <article>
            <CircleDollarSign/>
            <h3>Banking QR</h3>
            <Badge value={data.config.paymentProvider}/>
            <p className="muted">Configure payOS credentials on the backend. Payment is confirmed by a verified
              webhook.</p>
          </article>
          <article>
            <Send/>
            <h3>Zalo / SMS</h3>
            <Badge value={data.config.notificationProvider}/>
            <p className="muted">Connect an approved messaging gateway. Demo notifications stay in this
              workspace.</p>
          </article>
        </div>
        <div className="panel-footer">
          Configure server integrations in backend/.env. See backend/docs/INTEGRATIONS.md. Credentials are never sent to
          the browser.
        </div>
      </section>
      {data.unmatchedReceipts.length > 0 && <section className="panel" style={{marginTop: 22}}>
          <div className="panel-header">
              <h2>Unmatched bank receipts</h2>
              <Badge value="REVIEW"/>
          </div>
          <div className="table-wrap">
              <table>
                  <thead>
                  <tr>
                      <th>Reference</th>
                      <th>Provider order code</th>
                      <th>Amount</th>
                  </tr>
                  </thead>
                  <tbody>{data.unmatchedReceipts.map((r: any) => <tr key={r.id}>
                    <td>{r.reference}</td>
                    <td>{r.orderCode}</td>
                    <td>{money(r.amount)}</td>
                  </tr>)}</tbody>
              </table>
          </div>
          <div className="panel-footer">Signed receipts without a matching local payment are retained here. Check
              these in provider/bank records; registration-test receipts may also appear.
          </div>
      </section>
      }
    </>
  );
};

export default Settings;