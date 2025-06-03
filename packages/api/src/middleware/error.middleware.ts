import { Context, Next } from 'koa';

/**
 * Custom error type to handle HTTP status codes
 */
interface AppError extends Error {
  status?: number;
  statusCode?: number;
  stack?: string;
}

/**
 * Global error handling middleware
 * Catches any unhandled errors and responds with an appropriate error message
 */
export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    // Convert unknown error to typed error
    const error = err as AppError;
    
    // Log the error
    console.error('Unhandled error:', error);

    // Set status code
    ctx.status = error.status || error.statusCode || 500;
    
    // Build error response
    const errorResponse = {
      success: false,
      error: {
        message: error.message || 'Internal Server Error',
      },
    };

    // Add error details in development mode
    if (process.env.NODE_ENV !== 'production' && error.stack) {
      (errorResponse.error as any).stack = error.stack;
    }

    ctx.body = errorResponse;
    
    // Emit the error for the app to possibly track with a monitoring service
    ctx.app.emit('error', error, ctx);
  }
}

/**
 * Middleware to handle 404 Not Found errors
 */
export async function notFoundHandler(ctx: Context) {
  ctx.status = 404;
  ctx.body = {
    success: false,
    error: {
      message: `Route ${ctx.method} ${ctx.url} not found`,
    },
  };
}