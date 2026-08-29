import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Collect zod error messages
    const errorMessages = err.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join(', ');
    next(new ApiError(400, `Validation Error: ${errorMessages}`));
  }
};
