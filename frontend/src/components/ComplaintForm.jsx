import React, { useState, useEffect } from 'react';
import SpeechInput from './SpeechInput';

export default function ComplaintForm({ onComplaintAdded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleTranscription = (text) => {
    // Basic heuristics to determine title vs description
    const cleanedText = text.trim();
    if (!title) {
      // Create a short title from the first few words
      const words = cleanedText.split(' ');
      const newTitle = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
      setTitle(newTitle);
    }
    
    // Append to description
    setDescription(prev => prev ? `${prev} ${cleanedText}` : cleanedText);
    
    // Auto-categorize based on keywords
    const lowerText = cleanedText.toLowerCase();
    if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipe') || lowerText.includes('flush')) {
      setCategory('Plumbing');
    } else if (lowerText.includes('light') || lowerText.includes('fan') || lowerText.includes('switch') || lowerText.includes('power')) {
      setCategory('Electrical');
    } else if (lowerText.includes('dirty') || lowerText.includes('clean') || lowerText.includes('trash') || lowerText.includes('dust')) {
      setCategory('Cleaning');
    } else if (lowerText.includes('loud') || lowerText.includes('music') || lowerText.includes('noise') || lowerText.includes('yelling')) {
      setCategory('Noise');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessage('Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category })
      });

      if (!response.ok) throw new Error('Failed to submit complaint');
      
      const newComplaint = await response.json();
      
      setTitle('');
      setDescription('');
      setCategory('Other');
      setMessage('Complaint submitted successfully!');
      
      if (onComplaintAdded) {
        onComplaintAdded(newComplaint);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <SpeechInput onTranscriptionComplete={handleTranscription} />
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="title">Short Title</label>
          <input 
            type="text" 
            id="title"
            className="input-field" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken Fan in Room 204"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="description">Detailed Description (Edit if needed)</label>
          <textarea 
            id="description"
            className="input-field" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Voice text will appear here..."
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="category">Category</label>
          <select 
            id="category"
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Noise">Noise</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {message && (
          <div style={{ marginBottom: '1rem', color: message.includes('Error') || message.includes('required') ? 'var(--danger-color)' : 'var(--accent-color)' }}>
            {message}
          </div>
        )}

        <button type="submit" className="btn" style={{ width: '100%' }} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
