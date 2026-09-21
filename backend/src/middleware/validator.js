const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errore di validazione',
      details: errors.array()
    });
  }
  next();
};

const userValidation = {
  register: [
    body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username non valido'),
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 8 }).withMessage('Password minima 8 caratteri'),
    handleValidationErrors
  ],
  updateProfile: [
    body('username').optional().trim().isLength({ min: 3, max: 50 }),
    body('bio').optional().isLength({ max: 1000 }),
    body('quote').optional().isLength({ max: 255 }),
    handleValidationErrors
  ]
};

const soulValidation = {
  create: [
    body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Nome obbligatorio'),
    body('category').isIn(['historical', 'celebrity', 'fictional', 'personal', 'other']),
    body('biography').optional().isLength({ max: 10000 }),
    handleValidationErrors
  ]
};

const userSoulValidation = {
  assign: [
    body('soul_id').isUUID().withMessage('ID anima non valido'),
    body('realm_id').isUUID().withMessage('ID regno non valido'),
    body('motivation').trim().isLength({ min: 50, max: 5000 }).withMessage('Motivazione tra 50 e 5000 caratteri'),
    body('punishment').optional().isLength({ max: 2000 }),
    body('beatitude').optional().isLength({ max: 2000 }),
    handleValidationErrors
  ]
};

const ticketValidation = {
  create: [
    body('subject').trim().isLength({ min: 5, max: 255 }).withMessage('Oggetto obbligatorio'),
    body('description').trim().isLength({ min: 20, max: 10000 }).withMessage('Descrizione tra 20 e 10000 caratteri'),
    body('category').isIn(['technical', 'account', 'report', 'feature_request', 'other']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    handleValidationErrors
  ],
  reply: [
    body('message').trim().isLength({ min: 1, max: 10000 }),
    body('is_internal').optional().isBoolean(),
    handleValidationErrors
  ]
};

const commentValidation = {
  create: [
    body('content').trim().isLength({ min: 1, max: 2000 }),
    body('user_soul_id').isUUID(),
    handleValidationErrors
  ]
};

module.exports = {
  userValidation,
  soulValidation,
  userSoulValidation,
  ticketValidation,
  commentValidation,
  handleValidationErrors
};