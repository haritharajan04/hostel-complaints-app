const { getDb } = require('../config/db');

module.exports = {
  getComplaints: async (req, res) => {
    try {
      const db = getDb();
      // Fetch all complaints sorted by creation timestamp (newest first)
      const complaints = await db.all('SELECT * FROM complaints ORDER BY createdAt DESC');
      
      // Parse historyLog JSON strings back to actual objects before returning
      const parsedComplaints = complaints.map(c => ({
        ...c,
        history: JSON.parse(c.historyLog || '[]')
      }));

      res.status(200).json(parsedComplaints);
    } catch (err) {
      console.error('[Complaints Controller] Fetch Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getComplaintById: async (req, res) => {
    const { id } = req.params;
    try {
      const db = getDb();
      const complaint = await db.get('SELECT * FROM complaints WHERE id = ?', id);
      
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      const parsed = {
        ...complaint,
        history: JSON.parse(complaint.historyLog || '[]')
      };

      res.status(200).json(parsed);
    } catch (err) {
      console.error('[Complaints Controller] Fetch Detail Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  createComplaint: async (req, res) => {
    const { title, description, category, studentName, roomNumber, priority } = req.body;
    let fileUrl = '';
    
    // Bind uploaded file URL securely if Multer successfully intercepted a file
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    try {
      const db = getDb();
      
      // Initialize a standard audit timeline log
      const initialHistory = [
        {
          status: 'Pending',
          updatedAt: new Date().toISOString(),
          remarks: 'Complaint successfully filed via Smart Voice Desk'
        }
      ];

      const result = await db.run(
        `INSERT INTO complaints (
          studentName, roomNumber, title, description, category, priority, status, fileUrl, historyLog
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentName || 'Anonymous Student',
          roomNumber || 'Unknown Room',
          title,
          description,
          category || 'Other',
          priority || 'Medium',
          'Pending',
          fileUrl,
          JSON.stringify(initialHistory)
        ]
      );

      // Fetch newly created complaint to return
      const created = await db.get('SELECT * FROM complaints WHERE id = ?', result.lastID);
      const parsed = {
        ...created,
        history: JSON.parse(created.historyLog || '[]')
      };

      res.status(201).json(parsed);
      // Broadcast new complaint instantly via Socket.IO
      if (global.io) {
        global.io.emit('complaint:created', parsed);
      }
    } catch (err) {
      console.error('[Complaints Controller] Creation Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateComplaint: async (req, res) => {
    const { id } = req.params;
    const { status, assignedTo, remarks, priority } = req.body;

    try {
      const db = getDb();
      const current = await db.get('SELECT * FROM complaints WHERE id = ?', id);
      if (!current) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Parse current audit logs
      const history = JSON.parse(current.historyLog || '[]');
      
      // Enforce status workflow boundary checks
      const allowedStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
      if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status transition target: ${status}` });
      }

      // Calculate updates
      const updatedStatus = status || current.status;
      const updatedAssigned = assignedTo !== undefined ? assignedTo : current.assignedTo;
      const updatedRemarks = remarks !== undefined ? remarks : current.remarks;
      const updatedPriority = priority || current.priority;

      // Append new event to timeline if status changes or actions occur
      const isStatusChanged = status && status !== current.status;
      const isAssignedChanged = assignedTo !== undefined && assignedTo !== current.assignedTo;
      
      let auditMessage = `Admin update actions applied.`;
      if (isStatusChanged) auditMessage = `Status successfully transitioned to ${updatedStatus}`;
      else if (isAssignedChanged) auditMessage = `Technician assignment updated to: ${updatedAssigned}`;

      history.push({
        status: updatedStatus,
        updatedAt: new Date().toISOString(),
        remarks: remarks || auditMessage
      });

      await db.run(
        `UPDATE complaints 
         SET status = ?, assignedTo = ?, remarks = ?, priority = ?, historyLog = ?
         WHERE id = ?`,
        [
          updatedStatus,
          updatedAssigned,
          updatedRemarks,
          updatedPriority,
          JSON.stringify(history),
          id
        ]
      );

      const updated = await db.get('SELECT * FROM complaints WHERE id = ?', id);
      const parsed = {
        ...updated,
        history: JSON.parse(updated.historyLog || '[]')
      };

      res.status(200).json(parsed);
      // Broadcast complaint update instantly via Socket.IO
      if (global.io) {
        global.io.emit('complaint:updated', parsed);
      }
    } catch (err) {
      console.error('[Complaints Controller] Update Error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
