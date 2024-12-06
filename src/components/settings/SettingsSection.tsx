import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Upload } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Settings, SettingsOption } from '../../types/settings';
import toast from 'react-hot-toast';

interface SettingsSectionProps {
  title: string;
  category: keyof Settings;
  items: SettingsOption[];
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  category,
  items = [],
}) => {
  const { addOption, updateOption, toggleOption, deleteOption, settings } = useSettingsStore();
  const [newValue, setNewValue] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newValue.trim()) {
      toast.error('Please enter a value');
      return;
    }
    if (items.some((item) => item.value === newValue.trim())) {
      toast.error('This value already exists');
      return;
    }

    const newOption: Partial<SettingsOption> = {
      value: newValue.trim(),
    };

    if (category === 'salespeople' || category === 'debtCollectors') {
      if (category === 'salespeople' && !newBranch) {
        toast.error('Please select a branch');
        return;
      }
      if (category === 'salespeople') {
        newOption.branch = newBranch;
      }
      newOption.imageUrl = imagePreview || undefined;
    }

    addOption(category, newValue.trim(), newOption);
    setNewValue('');
    setNewBranch('');
    setImagePreview(null);
    toast.success('Option added successfully');
  };

  const handleUpdate = (id: string) => {
    if (!editValue.trim()) {
      toast.error('Please enter a value');
      return;
    }
    if (
      items.some(
        (item) => item.value === editValue.trim() && item.id !== id
      )
    ) {
      toast.error('This value already exists');
      return;
    }

    const updatedOption: Partial<SettingsOption> = {
      value: editValue.trim(),
    };

    if (category === 'salespeople' || category === 'debtCollectors') {
      if (category === 'salespeople' && !editBranch) {
        toast.error('Please select a branch');
        return;
      }
      if (category === 'salespeople') {
        updatedOption.branch = editBranch;
      }
      if (imagePreview) {
        updatedOption.imageUrl = imagePreview;
      }
    }

    updateOption(category, id, updatedOption);
    setEditingId(null);
    setEditValue('');
    setEditBranch('');
    setImagePreview(null);
    toast.success('Option updated successfully');
  };

  const startEdit = (item: SettingsOption) => {
    setEditingId(item.id);
    setEditValue(item.value);
    if (category === 'salespeople') {
      setEditBranch(item.branch || '');
    }
    if (item.imageUrl) {
      setImagePreview(item.imageUrl);
    }
  };

  const handleDelete = (id: string) => {
    deleteOption(category, id);
    toast.success('Option deleted successfully');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      
      <div className="space-y-4 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Add new option"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {category === 'salespeople' && (
            <select
              value={newBranch}
              onChange={(e) => setNewBranch(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Branch</option>
              {settings.branches
                .filter(branch => branch.isActive)
                .map(branch => (
                  <option key={branch.id} value={branch.value}>
                    {branch.value}
                  </option>
                ))}
            </select>
          )}
          {(category === 'salespeople' || category === 'debtCollectors') && (
            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
              <Upload size={16} />
              <span className="text-sm">Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
          <button
            onClick={handleAdd}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
        </div>
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Profile preview"
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        )}
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-md"
          >
            {editingId === item.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {category === 'salespeople' && (
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Branch</option>
                    {settings.branches
                      .filter(branch => branch.isActive)
                      .map(branch => (
                        <option key={branch.id} value={branch.value}>
                          {branch.value}
                        </option>
                      ))}
                  </select>
                )}
                {(category === 'salespeople' || category === 'debtCollectors') && (
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <Upload size={16} />
                    <span className="text-sm">Change Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(item.id)}
                    className="p-1 text-green-600 hover:text-green-700"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditValue('');
                      setEditBranch('');
                      setImagePreview(null);
                    }}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 flex-1">
                  {(category === 'salespeople' || category === 'debtCollectors') && item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.value}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <span className="font-medium">{item.value}</span>
                    {category === 'salespeople' && item.branch && (
                      <span className="ml-2 text-sm text-gray-500">
                        ({item.branch})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};