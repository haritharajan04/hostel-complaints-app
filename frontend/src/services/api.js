// Centralized API Integration Service
// Supports local localStorage fallback to allow mock edits to persist across page refreshes.

const API_BASE_URL = 'http://localhost:5000/api';

// Initial high-quality mock data for testing
const INITIAL_MOCK_COMPLAINTS = [
  {
    id: 1,
    studentName: 'Aarav Sharma',
    roomNumber: 'A-204',
    title: 'Ceiling fan making loud noise',
    description: 'The ceiling fan in my room is making a constant rattling noise when run at speed 3 or higher. It makes it very difficult to sleep or study.',
    category: 'Electrical',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    status: 'Pending',
    priority: 'Medium',
    assignedTo: '',
    remarks: '',
    history: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), remarks: 'Complaint logged successfully via Voice System' }
    ]
  },
  {
    id: 2,
    studentName: 'Rohan Verma',
    roomNumber: 'B-108',
    title: 'Bathroom pipe leakage',
    description: 'There is a steady water leakage from the pipe under the washbasin in the common bathroom of Floor 1, B-block. Water is accumulating on the floor causing slip hazard.',
    category: 'Plumbing',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
    status: 'Assigned',
    priority: 'High',
    assignedTo: 'Ramesh Kumar (Plumber)',
    remarks: 'Assigned to plumber Ramesh. Scheduled for repair tomorrow morning.',
    history: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(), remarks: 'Complaint logged successfully' },
      { status: 'Assigned', updatedAt: new Date(Date.now() - 22 * 3600000).toISOString(), remarks: 'Assigned to Ramesh Kumar (Plumber)' }
    ]
  },
  {
    id: 3,
    studentName: 'Neha Patel',
    roomNumber: 'C-302',
    title: 'Wi-Fi connection issues',
    description: 'The Wi-Fi router on block C, 3rd floor, is constantly dropping connections. The speed is extremely slow (< 1 Mbps), which is disrupting online lectures.',
    category: 'Other',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), // 2 days ago
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Tech Support Team',
    remarks: 'Router diagnostics show high interference. Ordered replacement router.',
    history: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 48 * 3600000).toISOString(), remarks: 'Complaint logged' },
      { status: 'Assigned', updatedAt: new Date(Date.now() - 46 * 3600000).toISOString(), remarks: 'Assigned to IT Team' },
      { status: 'In Progress', updatedAt: new Date(Date.now() - 44 * 3600000).toISOString(), remarks: 'IT Team confirmed interference issue, replacement scheduled.' }
    ]
  },
  {
    id: 4,
    studentName: 'Vikram Singh',
    roomNumber: 'A-112',
    title: 'Room cleaning not done',
    description: 'The regular weekly cleaning of room A-112 has been missed. Dust has accumulated on the window sills and floor.',
    category: 'Cleaning',
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(), // 3 days ago
    status: 'Resolved',
    priority: 'Low',
    assignedTo: 'Cleaning Staff - Sunita',
    remarks: 'Room cleaned and verified by student.',
    history: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 72 * 3600000).toISOString(), remarks: 'Logged' },
      { status: 'In Progress', updatedAt: new Date(Date.now() - 70 * 3600000).toISOString(), remarks: 'Sunita assigned' },
      { status: 'Resolved', updatedAt: new Date(Date.now() - 68 * 3600000).toISOString(), remarks: 'Cleaned and student signed off' }
    ]
  },
  {
    id: 5,
    studentName: 'Priya Nair',
    roomNumber: 'C-215',
    title: 'Loud music from next door',
    description: 'Loud music is being played past 11:30 PM by students in room C-216, disturbing sleep before end-term exams.',
    category: 'Noise',
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(), // 4 days ago
    status: 'Rejected',
    priority: 'Low',
    assignedTo: 'Hostel Warden',
    remarks: 'Warden visited the site, students were playing soft music within guidelines. Settled amicably.',
    history: [
      { status: 'Pending', updatedAt: new Date(Date.now() - 96 * 3600000).toISOString(), remarks: 'Logged' },
      { status: 'Rejected', updatedAt: new Date(Date.now() - 95 * 3600000).toISOString(), remarks: 'Dismissed by Warden after site inspection.' }
    ]
  }
];

// Helper to initialize complaints in localStorage
const getStoredComplaints = () => {
  const stored = localStorage.getItem('hostel_complaints');
  if (!stored) {
    localStorage.setItem('hostel_complaints', JSON.stringify(INITIAL_MOCK_COMPLAINTS));
    return INITIAL_MOCK_COMPLAINTS;
  }
  return JSON.parse(stored);
};

const saveStoredComplaints = (complaints) => {
  localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
};

export const apiService = {
  // Use mock storage flag - set to true to test local UI, set to false to connect to active SQLite backend
  useMock: true,

  // Admin Authentication
  login: async (username, password) => {
    if (apiService.useMock) {
      // Mock login validation
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (username === 'admin' && password === 'admin123') {
            const token = 'mock-jwt-token-12345';
            localStorage.setItem('admin_token', token);
            resolve({ token, username, success: true });
          } else {
            reject(new Error('Invalid username or password'));
          }
        }, 800);
      });
    } else {
      // SQLite backend endpoint
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('admin_token', data.token);
      return data;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  },

  // Get all complaints
  getComplaints: async () => {
    if (apiService.useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(getStoredComplaints());
        }, 400);
      });
    } else {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch complaints');
      return response.json();
    }
  },

  // Get a single complaint by ID
  getComplaintById: async (id) => {
    const numericId = parseInt(id, 10);
    if (apiService.useMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const complaints = getStoredComplaints();
          const complaint = complaints.find(c => c.id === numericId);
          if (complaint) {
            resolve(complaint);
          } else {
            reject(new Error('Complaint not found'));
          }
        }, 200);
      });
    } else {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
      });
      if (!response.ok) throw new Error('Complaint not found');
      return response.json();
    }
  },

  // Update a complaint status, remarks, assignment
  updateComplaint: async (id, updateData) => {
    const numericId = parseInt(id, 10);
    if (apiService.useMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const complaints = getStoredComplaints();
          const index = complaints.findIndex(c => c.id === numericId);
          if (index !== -1) {
            const current = complaints[index];
            const updated = {
              ...current,
              ...updateData,
              history: [
                ...current.history,
                {
                  status: updateData.status || current.status,
                  updatedAt: new Date().toISOString(),
                  remarks: updateData.remarks || `Status updated to ${updateData.status}`
                }
              ]
            };
            complaints[index] = updated;
            saveStoredComplaints(complaints);
            resolve(updated);
          } else {
            reject(new Error('Complaint not found'));
          }
        }, 350);
      });
    } else {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error('Failed to update complaint');
      return response.json();
    }
  },

  // Log a new complaint (useful for integrating from student form)
  createComplaint: async (complaintData) => {
    if (apiService.useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const complaints = getStoredComplaints();
          const newComplaint = {
            id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
            studentName: complaintData.studentName || 'Anonymous Student',
            roomNumber: complaintData.roomNumber || 'Unknown Room',
            title: complaintData.title,
            description: complaintData.description,
            category: complaintData.category || 'Other',
            createdAt: new Date().toISOString(),
            status: 'Pending',
            priority: complaintData.priority || 'Medium',
            assignedTo: '',
            remarks: '',
            history: [
              { status: 'Pending', updatedAt: new Date().toISOString(), remarks: 'Complaint submitted successfully' }
            ]
          };
          complaints.unshift(newComplaint);
          saveStoredComplaints(complaints);
          resolve(newComplaint);
        }, 300);
      });
    } else {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData)
      });
      if (!response.ok) throw new Error('Failed to submit complaint');
      return response.json();
    }
  }
};
