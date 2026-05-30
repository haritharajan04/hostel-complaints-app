import React, { useState } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import SpeechInput from './SpeechInput';

export default function ComplaintForm({ onComplaintAdded }) {
  const [studentName, setStudentName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleTranscription = (text) => {
    if (!text || typeof text !== 'string') {
      setMessage("Transcription failed or returned empty format.");
      return;
    }
    
    const cleanedText = text.trim();
    if (!cleanedText) {
      setMessage("We couldn't hear you! Please check your microphone permissions and speak clearly.");
      return;
    }

    if (!title) {
      const words = cleanedText.split(' ');
      const newTitle = words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
      setTitle(newTitle);
    }
    
    setDescription(prev => prev ? `${prev} ${cleanedText}` : cleanedText);
    
    // Auto-categorize based on keywords
    const lowerText = cleanedText.toLowerCase();
    if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipe') || lowerText.includes('flush') || lowerText.includes('shower')) {
      setCategory('Plumbing');
    } else if (lowerText.includes('light') || lowerText.includes('fan') || lowerText.includes('switch') || lowerText.includes('power') || lowerText.includes('bulb')) {
      setCategory('Electrical');
    } else if (lowerText.includes('dirty') || lowerText.includes('clean') || lowerText.includes('trash') || lowerText.includes('dust') || lowerText.includes('sweep')) {
      setCategory('Cleaning');
    } else if (lowerText.includes('loud') || lowerText.includes('music') || lowerText.includes('noise') || lowerText.includes('yelling')) {
      setCategory('Noise');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Rigid secure verification
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Error: Photo size exceeds the strict 5MB limit.');
      return;
    }

    const allowedMime = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMime.includes(file.type)) {
      setMessage('Error: Invalid photo type. Only JPEG and PNG are allowed.');
      return;
    }

    setImageFile(file);
    setMessage('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessage('Error: Title and description are required.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Build FormData payload for secure uploads mapping
      const formData = new FormData();
      formData.append('studentName', studentName || 'Anonymous Student');
      formData.append('roomNumber', roomNumber || 'A-204');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (imageFile) {
        formData.append('file', imageFile);
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Failed to submit complaint');
      }
      
      const newComplaint = await response.json();
      
      // Reset form states
      setStudentName('');
      setRoomNumber('');
      setTitle('');
      setDescription('');
      setCategory('Other');
      setImageFile(null);
      setImagePreview('');
      setMessage('Complaint submitted successfully with Socket.IO updates!');
      
      if (onComplaintAdded) {
        onComplaintAdded(newComplaint);
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel">
      <SpeechInput onTranscriptionComplete={handleTranscription} />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label htmlFor="studentName">Your Name</label>
            <input 
              type="text" 
              id="studentName"
              className="input-field" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="roomNumber">Room Number</label>
            <input 
              type="text" 
              id="roomNumber"
              className="input-field" 
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. A-204"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="title">Short Title</label>
          <input 
            type="text" 
            id="title"
            className="input-field" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken Fan in Room"
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

        {/* Secure Image File Upload Selector block */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Attach Issue Photograph (Optional, Max 5MB)
          </label>
          
          {imagePreview ? (
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img 
                src={imagePreview} 
                alt="Issue upload preview" 
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute top-2.5 right-2.5 p-1 rounded-full bg-black/60 hover:bg-black text-slate-350 hover:text-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 transition-all cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-6 h-6 text-slate-500 mb-1" />
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Choose Photo Attachment
                </p>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {message && (
          <div style={{ marginBottom: '1rem', color: message.includes('Error') || message.includes('failed') ? 'var(--danger-color)' : 'var(--accent-color)' }}>
            {message}
          </div>
        )}

        <button type="submit" className="btn" style={{ width: '100%' }} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting complaint data...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
