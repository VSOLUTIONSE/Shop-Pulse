'use client';

import { useState, forwardRef } from 'react';
import type { PrintData } from './print-data';
import { formatMoney } from '@/lib/utils';

const RECEIPT_PAGE_STYLE = `
  @page { size: 58mm 210mm; margin: 0; }
  @media print {
    html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
  }
`;

const ReceiptDocument = forwardRef<HTMLDivElement, { data: PrintData }>(
  function ReceiptDocument({ data }, ref) {
    const [logoBroken, setLogoBroken] = useState(false);
    const fmt = (cents: number) => formatMoney(cents);

    return (
      <div
        ref={ref}
        style={{
          width: '58mm',
          background: '#fff',
          color: '#000',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          fontWeight: 700,
          lineHeight: 1.4,
          padding: '3mm 2mm',
          boxSizing: 'border-box',
        }}
      >
        <style>{RECEIPT_PAGE_STYLE}</style>

        <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
          {logoBroken ? (
            <div
              style={{
                width: '14mm',
                height: '14mm',
                margin: '0 auto',
                borderRadius: '50%',
                background: '#4f46e5',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7mm',
              }}
            >
              {data.shop.name.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              src="/logo.png"
              alt={data.shop.name}
              onError={() => setLogoBroken(true)}
              style={{ maxHeight: '12mm', maxWidth: '50mm', objectFit: 'contain' }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '1mm' }}>
            {data.shop.name}
          </div>
          {data.shop.address && <div>{data.shop.address}</div>}
          {data.shop.phone && <div>{data.shop.phone}</div>}
          {data.shop.tinVat && <div>TIN: {data.shop.tinVat}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Receipt: #{String(data.saleId).padStart(4, '0')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{new Date(data.date).toLocaleString('en-NG')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cashier:</span>
            <span style={{ textTransform: 'capitalize' }}>{data.operatorRole}</span>
          </div>
          {data.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer:</span>
              <span>{data.customerName}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '1mm 0', margin: '1mm 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Item</span>
            <span>Qty x Price</span>
            <span>Amount</span>
          </div>
          {data.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '1mm' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.productName}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>
                {item.quantity} x {fmt(item.unitPriceCents)}
              </span>
              <span style={{ whiteSpace: 'nowrap' }}>{fmt(item.lineTotalCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal</span>
          <span>{fmt(data.subtotalCents)}</span>
        </div>
        {data.discountCents > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount</span>
            <span>-{fmt(data.discountCents)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
          <span>TOTAL</span>
          <span>{fmt(data.totalCents)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1mm' }}>
          {data.payments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ textTransform: 'capitalize' }}>{p.method}</span>
              <span>{fmt(p.amountCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '3mm' }}>
          <div>Thank you for your patronage!</div>
          <div>Powered by SalesPulse</div>
        </div>
      </div>
    );
  }
);

export default ReceiptDocument;
