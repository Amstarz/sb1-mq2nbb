import React from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { Receipt } from '../../types/receipt';

interface TableBodyProps {
  rows: Row<Receipt>[];
  onRowClick: (receipt: Receipt) => void;
}

export const TableBody: React.FC<TableBodyProps> = ({ rows, onRowClick }) => {
  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((row) => (
        <tr
          key={`row-${row.id}`}
          onClick={() => onRowClick(row.original)}
          className="hover:bg-gray-50 cursor-pointer"
        >
          {row.getVisibleCells().map((cell) => (
            <td
              key={`cell-${row.id}-${cell.column.id}`}
              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
};