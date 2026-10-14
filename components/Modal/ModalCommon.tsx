import React from "react";

export function ModalCommon({title, onClose, children}: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onClick={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
      <div className="panel-header"><h2>{title}</h2>
        <button onClick={onClose} aria-label="Close dialog" className="icon-button">×</button>
      </div>
      <div className="panel-body">{children}</div>
    </section>
  </div>;
}