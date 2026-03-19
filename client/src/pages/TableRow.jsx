import React from 'react';

const numberClass = (n) => {
  if (n == null) return '';
  return Number(n) > 0 ? 'text-emerald-500' : Number(n) < 0 ? 'text-rose-500' : '';
};

const format = (v) => {
  if (v == null) return '-';
  const n = Number(v);
  if (!isNaN(n)) return n.toLocaleString();
  return v;
};

const TableRow = ({ row }) => {
  return (
    <tr className="border-t border-dark-800 hover:bg-dark-800">
      <td className="px-3 py-2">{row.time}</td>
      <td className="px-3 py-2">{format(row.futPrice)}</td>
      <td className={`px-3 py-2 ${numberClass(row.futPriceChg)}`}>{format(row.futPriceChg)}</td>
      <td className={`px-3 py-2 ${numberClass(row.futPriceChgPct)}`}>{format(row.futPriceChgPct)}</td>
      <td className="px-3 py-2">{format(row.vwap)}</td>
      <td className="px-3 py-2">{format(row.iv)}</td>
      <td className="px-3 py-2">{format(row.futVolume)}</td>
      <td className="px-3 py-2">{format(row.totalOi)}</td>
      <td className={`px-3 py-2 ${numberClass(row.oiChange)}`}>{format(row.oiChange)}</td>
      <td className={`px-3 py-2 ${numberClass(row.oiChangePct)}`}>{format(row.oiChangePct)}</td>
      <td className={`px-3 py-2 ${numberClass(row.pcrOi)}`}>{format(row.pcrOi)}</td>
      <td className={`px-3 py-2 ${numberClass(row.totCeOiCh)}`}>{format(row.totCeOiCh)}</td>
      <td className={`px-3 py-2 ${numberClass(row.totPeOiCh)}`}>{format(row.totPeOiCh)}</td>
      <td className={`px-3 py-2 ${numberClass(row.pcrOiCh)}`}>{format(row.pcrOiCh)}</td>
      <td className={`px-3 py-2 ${numberClass(row.diff)}`}>{format(row.diff)}</td>
      <td className={`px-3 py-2 ${numberClass(row.diffPct)}`}>{format(row.diffPct)}</td>
      <td className={`px-3 py-2 ${numberClass(row.ceOiCh)}`}>{format(row.ceOiCh)}</td>
      <td className={`px-3 py-2 ${numberClass(row.peOiCh)}`}>{format(row.peOiCh)}</td>
      <td className="px-3 py-2">{row.oiTrend}</td>
    </tr>
  );
};

export default TableRow;
