export const errorHandler = (err, req, res, next) => {
  console.error('Error Catch-All:', err.stack || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
