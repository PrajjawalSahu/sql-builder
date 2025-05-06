import React, { useState } from 'react';
import './MetadataForm.css';

export default function MetadataForm() {
  const [metadata, setMetadata] = useState([{ column: '', description: '' }]);
  const [status, setStatus] = useState('');

  const handleChange = (index, field, value) => {
    const updated = [...metadata];
    updated[index][field] = value;
    setMetadata(updated);
  };

  const addRow = () => {
    setMetadata([...metadata, { column: '', description: '' }]);
  };

  const removeRow = (index) => {
    const updated = metadata.filter((_, i) => i !== index);
    setMetadata(updated);
  };

  const handleSubmit = async () => {
    const payload = {
      metadata: metadata.reduce((acc, item) => {
        if (item.column && item.description) {
          acc[item.column] = item.description;
        }
        return acc;
      }, {})
    };

    try {
      const response = await fetch('https://3e3f-34-169-250-144.ngrok-free.app/set_metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus('✅ Metadata set successfully.');
      } else {
        setStatus('❌ Failed to set metadata.');
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Error connecting to server.');
    }
  };

  return (
    <div className="metadata-form">
      <h3>Set Metadata</h3>
      {metadata.map((row, idx) => (
        <div key={idx} className="metadata-row">
          <input
            placeholder="Column ID (e.g., col_123)"
            value={row.column}
            onChange={(e) => handleChange(idx, 'column', e.target.value)}
          />
          <input
            placeholder="Description (e.g., Total annual revenue...)"
            value={row.description}
            onChange={(e) => handleChange(idx, 'description', e.target.value)}
          />
          <button onClick={() => removeRow(idx)} disabled={metadata.length === 1}>🗑</button>
        </div>
      ))}
      <button onClick={addRow}>➕ Add More</button>
      <button onClick={handleSubmit}>🚀 Set Metadata</button>
      {status && <div className="status">{status}</div>}
    </div>
  );
}
