import { AppError } from '../utils/AppError.js';

export const errorHandler = (error, _req, res, _next) => {
  const wantsHtml = !_req.path.startsWith('/api/');

  if (wantsHtml) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : 'Erro interno do servidor';

    return res.status(statusCode).render('errors/show', {
      title: 'Erro',
      statusCode,
      message
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        message: error.message,
        details: error.details
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
};
