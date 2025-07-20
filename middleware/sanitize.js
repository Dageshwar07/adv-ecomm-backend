import xss from 'xss';

// XSS sanitization options
const xssOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script'], // Remove script tags
};

// Sanitize string values
const sanitizeString = (value) => {
  if (typeof value === 'string') {
    return xss(value.trim(), xssOptions);
  }
  return value;
};

// Recursively sanitize object
const sanitizeObject = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return sanitizeString(obj);
};

// Sanitization middleware
export const sanitize = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters - handle each property individually
  if (req.query) {
    const sanitizedQuery = sanitizeObject(req.query);
    // Clear existing query properties and set sanitized ones
    Object.keys(req.query).forEach(key => {
      delete req.query[key];
    });
    Object.assign(req.query, sanitizedQuery);
  }
  
  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Specific field sanitization
export const sanitizeFields = (fields) => {
  return (req, res, next) => {
    if (req.body) {
      fields.forEach(field => {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = sanitizeString(req.body[field]);
        }
      });
    }
    next();
  };
};

// HTML content sanitization (for rich text fields)
export const sanitizeHTML = (req, res, next) => {
  const htmlFields = ['description', 'comment', 'notes', 'adminResponse'];
  
  if (req.body) {
    htmlFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Allow some safe HTML tags for rich content
        const htmlOptions = {
          whiteList: {
            p: [],
            br: [],
            strong: [],
            em: [],
            u: [],
            ol: [],
            ul: [],
            li: [],
            h1: [],
            h2: [],
            h3: [],
            h4: [],
            h5: [],
            h6: [],
          },
          stripIgnoreTag: true,
          stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
        };
        req.body[field] = xss(req.body[field], htmlOptions);
      }
    });
  }
  
  next();
};

// Email sanitization
export const sanitizeEmail = (req, res, next) => {
  if (req.body && req.body.email) {
    req.body.email = req.body.email.toLowerCase().trim();
  }
  next();
};

// Phone number sanitization
export const sanitizePhone = (req, res, next) => {
  if (req.body && req.body.phone) {
    // Remove all non-digit characters except +, -, (, ), and space
    req.body.phone = req.body.phone.replace(/[^\d\s\+\-\(\)]/g, '');
  }
  next();
};

// URL sanitization
export const sanitizeURL = (req, res, next) => {
  const urlFields = ['image', 'avatar', 'mobileImage', 'link'];
  
  if (req.body) {
    urlFields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Ensure URL starts with http:// or https://
        let url = req.body[field].trim();
        if (url && !url.match(/^https?:\/\//)) {
          url = 'https://' + url;
        }
        req.body[field] = url;
      }
    });
  }
  
  next();
};

// Price sanitization
export const sanitizePrice = (req, res, next) => {
  const priceFields = ['price', 'oldPrice', 'totalPrice', 'itemsPrice', 'taxPrice', 'shippingPrice'];
  
  if (req.body) {
    priceFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        // Convert to number and round to 2 decimal places
        const price = parseFloat(req.body[field]);
        if (!isNaN(price)) {
          req.body[field] = Math.round(price * 100) / 100;
        }
      }
    });
  }
  
  next();
};

// Comprehensive sanitization for all routes
export const comprehensiveSanitize = [
  sanitize,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,
  sanitizePrice,
  sanitizeHTML,
]; 