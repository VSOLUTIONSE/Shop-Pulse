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
          fontFamily: 'Inter, sans-serif',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: 1.5,
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
              src="/landing/logo.png"
              alt={data.shop.name}
              onError={() => setLogoBroken(true)}
              style={{ maxHeight: '12mm', maxWidth: '50mm', objectFit: 'contain' }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: '14px', marginTop: '1mm' }}>
            {data.shop.name}
          </div>
          {data.shop.address && <div style={{ fontSize: '11px' }}>{data.shop.address}</div>}
          {data.shop.phone && <div style={{ fontSize: '11px' }}>{data.shop.phone}</div>}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1.5mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
            <span>Receipt</span>
            <span>#{String(data.saleId).padStart(4, '0')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
            <span>Date</span>
            <span>{new Date(data.date).toLocaleString('en-NG')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
            <span>Cashier</span>
            <span style={{ textTransform: 'capitalize' }}>{data.operatorRole}</span>
          </div>
          {data.customerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
              <span>Customer</span>
              <span>{data.customerName}</span>
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: '1px dashed #000',
            borderBottom: '1px dashed #000',
            padding: '1.5mm 0',
            margin: '1mm 0',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              marginBottom: '1mm',
            }}
          >
            <span>Item</span>
            <span>Amount</span>
          </div>
          {data.items.map((item, idx) => (
            <div key={idx} style={{ marginTop: '1mm' }}>
              <div style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
                {item.productName}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
                <span>
                  {item.quantity} x {fmt(item.unitPriceCents)}
                </span>
                <span>{fmt(item.lineTotalCents)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm', marginTop: '1.5mm' }}>
          <span>Subtotal</span>
          <span>{fmt(data.subtotalCents)}</span>
        </div>
        {data.discountCents > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
            <span>Discount</span>
            <span>-{fmt(data.discountCents)}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '2mm',
            fontWeight: 700,
            fontSize: '14px',
            marginTop: '1mm',
          }}
        >
          <span>TOTAL</span>
          <span>{fmt(data.totalCents)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '2mm 0', paddingTop: '1.5mm' }}>
          {data.payments.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '2mm' }}>
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
