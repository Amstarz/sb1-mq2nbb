import React from 'react';
import { flexRender, HeaderGroup } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Receipt } from '../../types/receipt';

interface TableHeaderProps {
  headerGroups: HeaderGroup<Receipt>[];
}

export const TableHeader: React.FC<TableHeaderProps> = ({ headerGroups }) => {
  return (
    <thead className="bg-gray-50">
      {headerGroups.map((headerGroup) => (
        <tr key={`header-group-${headerGroup.id}`}>
          {headerGroup.headers.map((header) => (
            <th
              key={`header-${header.id}`}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
              onClick={header.column.getToggleSortingHandler()}
            >
              <div className="flex items-center gap-2">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                <ArrowUpDown size={14} className="text-gray-400" />
              </div>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};