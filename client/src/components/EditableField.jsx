import React, { useState } from 'react';

const EditableField = ({ label, value, fieldKey, type = "text", onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (tempValue === value) {
      setIsEditing(false); // No changes made
      return;
    }
    
    setIsSaving(true);
    try {
      // Call the parent function which handles the actual API request
      await onSave(fieldKey, tempValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Save failed", error);
      // Revert to original on failure
      setTempValue(value || ''); 
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setTempValue(value || '');
      setIsEditing(false);
    }
  };

  return (
    <li className="group flex flex-col min-h-[44px]">
      <strong className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</strong>
      
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type={type}
            autoFocus
            className="border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-sm outline-none w-full text-gray-800"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
          />
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="text-green-600 hover:text-green-800"
            title="Save (Enter)"
          >
            {isSaving ? '...' : '✓'}
          </button>
          <button 
            onClick={() => { setIsEditing(false); setTempValue(value || ''); }} 
            disabled={isSaving}
            className="text-red-500 hover:text-red-700"
            title="Cancel (Esc)"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-800 font-medium">
            {value || 'N/A'}
          </span>
          {/* The Edit Pencil Icon - Appears on Hover */}
          <button
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 p-1 rounded"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      )}
    </li>
  );
};

export default EditableField;