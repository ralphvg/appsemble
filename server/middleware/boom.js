/**
 * Koa middleware for handling Boom errors.
 */
export default async function boom(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (!err.isBoom) {
      throw err;
    }
    const { output } = err;
    ctx.status = output.statusCode;
    ctx.body = output.payload;
    if (err.data) {
      ctx.body.data = err.data;
    }
    Object.entries(output.headers).forEach(([name, value]) => {
      ctx.set(name, value);
    });
  }
}