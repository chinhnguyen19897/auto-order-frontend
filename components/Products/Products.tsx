import React from 'react';
import {Package} from "lucide-react";
import {Badge} from "../Badge/Badge";
import {money} from "../../utils/currency";

type ProductsProps = {
  data?: any,
  editProduct?: (value: any) => void

}


const Products = ({data, editProduct}: ProductsProps) => {
  return (
    <div className="product-grid">
      {
        data?.products.map((p: any) => <section className="panel product-card" key={p.id}>
            <div className="product-visual">
              <Package size={55}/>
              <span>{p.sku}</span>
            </div>
            <div className="panel-body">
              <div className="row spread">
                <h2>{p.name}</h2>
                <Badge value={p.active ? 'ACTIVE' : 'INACTIVE'}/>
              </div>
              <strong className="price">{money(p.price)}</strong>
              <p className="muted small">Deposit {money(p.deposit)} · {p.stock} units available</p>
              <button className="secondary full" onClick={() => editProduct ? editProduct(p) : null}>Edit product</button>
            </div>
          </section>
        )}
      {
        data.products.length === 0 &&
          <div className="empty">Add your first product to start.</div>
      }
    </div>
  );
};

export default Products;