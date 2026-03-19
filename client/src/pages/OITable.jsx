import React, { useMemo } from 'react';
import TableRow from './TableRow';

const OITable = ({ data }) => {
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="bg-dark-900 rounded-md border border-dark-700 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-dark-400">
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Fut Price</th>
            <th className="px-3 py-2">Fut Price Chg</th>
            <th className="px-3 py-2">Fut Price Chg %</th>
            <th className="px-3 py-2">VWAP</th>
            <th className="px-3 py-2">IV</th>
            <th className="px-3 py-2">Fut Volume</th>
            <th className="px-3 py-2">Total OI</th>
            <th className="px-3 py-2">OI Change</th>
            <th className="px-3 py-2">OI Change %</th>
            <th className="px-3 py-2">PCR-OI</th>
            <th className="px-3 py-2">Tot CE OI Chg</th>
            <th className="px-3 py-2">Tot PE OI Chg</th>
            <th className="px-3 py-2">PCR-OI Chg</th>
            <th className="px-3 py-2">Diff</th>
            <th className="px-3 py-2">Diff %</th>
            <th className="px-3 py-2">CE OI Chg</th>
            <th className="px-3 py-2">PE OI Chg</th>
            <th className="px-3 py-2">OI Change Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => <TableRow key={idx} row={r} />)}
        </tbody>
      </table>
    </div>
  );
};

export default OITable;
