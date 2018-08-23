import fs from 'fs';
import path from 'path';

import klawSync from 'klaw-sync';
import Router from 'koa-router';


export default async function configureStatic(app) {
  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(__dirname, '../../dist');
    const router = new Router();
    const assets = klawSync(distDir, { nodir: true }).map(asset => asset.path)
      .map((asset) => {
        router.get(`/${path.relative(distDir, asset)}`, (ctx) => {
          ctx.body = fs.createReadStream(asset);
          ctx.type = path.extname(asset);
        });
        return asset;
      })
      .filter(asset => [distDir, path.join(distDir, 'app')].includes(path.dirname(asset)))
      .map(asset => path.relative(distDir, asset));
    app.use(router.routes());
    app.use(router.allowedMethods());
    app.use(async (ctx, next) => {
      ctx.state.assets = assets;
      await next();
    });
  } else {
    const { default: koaWebpack } = await import('koa-webpack');
    const { default: webpackConfig } = await import('../../webpack.config');
    const config = await webpackConfig(null, { mode: 'development' });
    const middleware = await koaWebpack({
      config,
      devMiddleware: {
        logLevel: 'warn',
        serverSideRender: true,
      },
    });
    app.use(middleware);
  }
}