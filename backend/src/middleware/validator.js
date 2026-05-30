module.exports = {
  validateComplaintInput: (req, res, next) => {
    const { title, description, category, studentName, roomNumber } = req.body;

    // Standard validators
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Validation failed: A valid non-empty title is required' });
    }
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Validation failed: A valid non-empty description is required' });
    }
    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({ error: 'Validation failed: A valid non-empty category is required' });
    }

    // Limit length to prevent buffer overruns / database DOS
    if (title.length > 100) {
      return res.status(400).json({ error: 'Validation failed: Title must be under 100 characters' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: 'Validation failed: Description must be under 2000 characters' });
    }

    // Sanitize basic tags to prevent plain XSS injections
    req.body.title = title.replace(/<[^>]*>/g, '').trim();
    req.body.description = description.replace(/<[^>]*>/g, '').trim();
    req.body.category = category.replace(/<[^>]*>/g, '').trim();
    
    if (studentName) req.body.studentName = studentName.replace(/<[^>]*>/g, '').trim();
    if (roomNumber) req.body.roomNumber = roomNumber.replace(/<[^>]*>/g, '').trim();

    next();
  }
};
