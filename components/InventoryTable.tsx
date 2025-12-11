
import React from 'react';
import type { InventoryItem } from '../types';

interface InventoryTableProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onResign: (employeeName: string) => void;
  onDelete?: (assetId: string) => void;
  view: 'All' | 'In Use' | 'In Stock' | 'Maintenance';
}

const formatSpecs = (item: InventoryItem) => {
    if (!item.specs) return '-';
    const { cpu, ram, storage, gpu, lcd } = item.specs;
    
    // For monitors, just show the LCD spec.
    if (item.type === 'Monitor' && lcd) {
        return lcd;
    }

    const parts = [cpu, ram, storage, gpu].filter(Boolean);
    if (parts.length === 0) return '-';
    
    return parts.join(' / ');
};


const InventoryTable: React.FC<InventoryTableProps> = ({ inventory, onEdit, onResign, onDelete, view }) => {
  const getStatusChip = (status: InventoryItem['status']) => {
    switch (status) {
      case 'In Use':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'In Stock':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const showAssignmentDetails = view === 'All' || view === 'In Use';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm text-left text-blue-600 dark:text-gray-400">
        <thead className="text-xs text-blue-900 uppercase bg-blue-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Brand</th>
            <th scope="col" className="px-6 py-3">Model</th>
            <th scope="col" className="px-6 py-3">Specifications</th>
            <th scope="col" className="px-6 py-3">Serial No.</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Assigned To</th>
            {showAssignmentDetails && <th scope="col" className="px-6 py-3">Department</th>}
            {showAssignmentDetails && <th scope="col" className="px-6 py-3">Issue Date</th>}
            <th scope="col" className="px-6 py-3">Others</th>
            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600">
              <th scope="row" className="px-6 py-4 font-medium text-blue-900 dark:text-white whitespace-nowrap">{item.type}</th>
              <td className="px-6 py-4 font-semibold text-blue-800">{item.brand || '-'}</td>
              <td className="px-6 py-4 text-blue-800">{item.model}</td>
              <td className="px-6 py-4 text-xs text-blue-600">{formatSpecs(item)}</td>
              <td className="px-6 py-4 font-mono text-xs text-blue-600">{item.serialNumber || '-'}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusChip(item.status)}`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-blue-800">{item.assignedTo || '-'}</td>
              {showAssignmentDetails && <td className="px-6 py-4 text-blue-800">{item.department || '-'}</td>}
              {showAssignmentDetails && <td className="px-6 py-4 text-blue-800">{item.issueDate || '-'}</td>}
              <td className="px-6 py-4 text-blue-600">{item.others || '-'}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-4">
                    <button onClick={() => onEdit(item)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                    {item.status === 'In Use' && item.assignedTo && (
                        <button 
                            onClick={() => onResign(item.assignedTo)} 
                            className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
                        >
                            Resign
                        </button>
                    )}
                    {onDelete && (
                         <button 
                            onClick={() => onDelete(item.id)} 
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                        >
                            Delete
                        </button>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
