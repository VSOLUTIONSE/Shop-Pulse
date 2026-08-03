'use client';

import { useState, forwardRef } from 'react';
import type { PrintData } from './print-data';
import { formatMoney } from '@/lib/utils';

const INVOICE_PAGE_STYLE = `
  @page { size: A4; margin: 12mm; }
  @media print {
    html, body { height: auto !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; }
  }
`;

const InvoiceDocument = forwardRef<HTMLDivElement, { data: PrintData }>(
  function InvoiceDocument({ data }, ref) {
    const [logoBroken, setLogoBroken] = useState(false);
    const fmt = (cents: number) => formatMoney(cents);

    return (
      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          background: '#fff',
          color: '#000',
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
          padding: '12mm',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{INVOICE_PAGE_STYLE}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #000', paddingBottom: '6mm' }}>
          <div>
            {logoBroken ? (
              <div
                style={{
                  width: '16mm',
                  height: '16mm',
                  borderRadius: '50%',
                  background: '#4f46e5',
                  color: '#fff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8mm',
                  marginBottom: '2mm',
                }}
              >
                {data.shop.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <img
                src="/logo.png"
                alt={data.shop.name}
                onError={() => setLogoBroken(true)}
                style={{ maxHeight: '18mm', maxWidth: '60mm', objectFit: 'contain', marginBottom: '2mm' }}
              />
            )}
            <div style={{ fontSize: '16px', fontWeight: 700 }}>{data.shop.name}</div>
            {data.shop.address && <div>{data.shop.address}</div>}
            {data.shop.phone && <div>{data.shop.phone}</div>}
            {data.shop.tinVat && <div>TIN: {data.shop.tinVat}</div>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '2px' }}>INVOICE</div>
            <div style={{ marginTop: '3mm' }}>Invoice No: INV-{String(data.saleId).padStart(4, '0')}</div>
            <div>Date: {new Date(data.date).toLocaleDateString('en-NG')}</div>
            <div>Time: {new Date(data.date).toLocaleTimeString('en-NG')}</div>
            <div style={{ textTransform: 'capitalize' }}>Cashier: {data.operatorRole}</div>
          </div>
        </div>

        {data.customerName && (
          <div style={{ border: '1px solid #000', borderRadius: '3mm', padding: '4mm', marginTop: '6mm' }}>
            <div style={{ fontWeight: 700, marginBottom: '1mm' }}>Bill To:</div>
            <div>{data.customerName}</div>
          </div>
        )}

        <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginTop: '8mm', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
              <th style={{ padding: '2mm' }}>#</th>
              <th style={{ padding: '2mm' }}>Item</th>
              <th style={{ padding: '2mm', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '2mm', textAlign: 'right' }}>Unit Price</th>
              <th style={{ padding: '2mm', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #999' }}>
                <td style={{ padding: '2mm' }}>{idx + 1}</td>
                <td style={{ padding: '2mm', wordBreak: 'break-word' }}>{item.productName}</td>
                <td style={{ padding: '2mm', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>{fmt(item.unitPriceCents)}</td>
                <td style={{ padding: '2mm', textAlign: 'right' }}>{fmt(item.lineTotalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginLeft: 'auto', width: '70mm', marginTop: '6mm', breakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1mm 0' }}>
            <span>Subtotal</span>
            <span>{fmt(data.subtotalCents)}</span>
          </div>
          {data.discountCents > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1mm 0' }}>
              <span>Discount</span>
              <span>-{fmt(data.discountCents)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '2px solid #000', paddingTop: '2mm' }}>
            <span>Total Due</span>
            <span>{fmt(data.totalCents)}</span>
          </div>
        </div>

        <div style={{ marginTop: '8mm', breakInside: 'avoid' }}>
          <div style={{ fontWeight: 700, marginBottom: '1mm' }}>Payment:</div>
          {data.payments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '120mm' }}>
              <span style={{ textTransform: 'capitalize' }}>{p.method}</span>
              <span>{fmt(p.amountCents)}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: '1px solid #999', marginTop: '10mm', paddingTop: '3mm', fontSize: '10px', display: 'flex', justifyContent: 'space-between', breakInside: 'avoid' }}>
          <span>Thank you for your business.</span>
          <span>Powered by SalesPulse</span>
        </div>
      </div>
    );
  }
);

export default InvoiceDocument;
