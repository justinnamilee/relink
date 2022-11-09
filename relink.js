import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import koa from 'koa';
import favicon from 'koa-favicon';
import { exit } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//? ///////////
//? Read Config

const cPath = __dirname + '/private/config.yml';

if (!fs.existsSync(cPath))
{
  console.error(`Config '${cPath}' must exist!`);
  exit(1);
}

const file = fs.readFileSync(cPath, 'utf8');
const conf = yaml.parse(file);

console.log(conf.meta.ui.config);


//? /////////
//? Setup Koa

const app = new koa({ proxy: true });

app.use(favicon(__dirname + '/public/' + conf.meta.koa.favicon));

app.use(async ctx => {
  if (conf.meta.app.debug)
  {
    console.debug(ctx.request);
  }

  let host = conf.meta.ui.noHost;

  if ('header' in ctx.request && 'host' in ctx.request.header)
  {
    host = ctx.request.header.host;
  }

  ctx.status = conf.meta.koa.status;

  if (ctx.request.url in conf.data)
  {
    const match = conf.data[ctx.request.url];
    console.log(host + conf.meta.ui.request.found + ctx.request.url);
    ctx.body = conf.meta.ui.body.found + match;
    ctx.redirect(match);
  }
  else
  {
    console.log(host + conf.meta.ui.request.notFound + ctx.request.url);
    ctx.body = conf.meta.ui.body.notFound;
    ctx.redirect(conf.meta.koa.defaultUrl);
  }
});

app.listen(conf.meta.app.port);

console.log(conf.meta.ui.running);
