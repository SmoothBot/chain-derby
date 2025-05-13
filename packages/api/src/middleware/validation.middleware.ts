import { Context, Next } from 'koa';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory function that creates middleware to validate request data against a Zod schema
 * 
 * @param schema The Zod schema to validate against
 * @param source Where to find the data (body, query, params)
 */
export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return async (ctx: Context, next: Next) => {
    try {
      // Select the appropriate source of data
      let data: any;
      switch (source) {
        case 'body':
          data = ctx.request.body;
          break;
        case 'query':
          data = ctx.query;
          break;
        case 'params':
          data = ctx.params;
          break;
      }

      // Validate the data
      const validatedData = await schema.parseAsync(data);
      
      // Replace the original data with the validated data
      switch (source) {
        case 'body':
          ctx.request.body = validatedData;
          break;
        case 'query':
          ctx.query = validatedData;
          break;
        case 'params':
          ctx.params = validatedData;
          break;
      }

      return next();
    } catch (error) {
      // If validation fails, return a 400 Bad Request
      if (error instanceof ZodError) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
        };
        return;
      }
      
      // If it's another type of error, pass it to the next error handler
      throw error;
    }
  };
}

/**
 * Middleware to validate request body contains a valid API key
 */
export function validateApiKey(ctx: Context, next: Next) {
  const apiKey = ctx.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== expectedApiKey) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: {
        message: 'Unauthorized: Invalid API key',
      },
    };
    return;
  }

  return next();
}