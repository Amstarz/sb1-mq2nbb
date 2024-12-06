import React from 'react';
import { Modal } from '../Modal';
import { Column } from '@tanstack/react-table';
import { Receipt } from '../../types/receipt';

interface ColumnSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column<Receipt, unknown>[];
  visibleColumns: string[];
  toggleColumn: (columnId: string) => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  toggleColumn,
}) => {
  const getColumnHeader = (column: Column<Receipt, unknown>) => {
    const columnDef = column.columnDef;
    if (typeof columnDef.header === 'string') {
      return columnDef.header;
    }
    return column.id || '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Columns">
      <div className="grid grid-cols-2 gap-4">
        {columns.map((column) => {
          const columnId = column.id!;
          return (
            <div key={`column-setting-${columnId}`} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`column-${columnId}`}
                checked={visibleColumns.includes(columnId)}
                onChange={() => toggleColumn(columnId)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <label
                htmlFor={`column-${columnId}`}
                className="text-sm text-gray-700"
              >
                {getColumnHeader(column)}
              </label>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};