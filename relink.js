import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';
import koa from 'koa';
import favicon from 'koa-favicon';
import bs from 'koa-bodyparser';
import { exit } from 'process';
import { isUri } from 'valid-url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//? ///////////
//? Read Config

const cPath = __dirname + '/private/config.yml';
const cPathBak = __dirname + '/private/.bak.config.yml';

if (!fs.existsSync(cPath)) {
  console.error(`Config '${cPath}' must exist!`);
  exit(1);
}

const conf = yaml.parse(fs.readFileSync(cPath, 'utf8'));
console.log(conf.meta.ui.config);


//? /////////
//? Setup Koa

const app = new koa({ proxy: true });

//! add some koa middleboiz
app.use(favicon(__dirname + '/public/' + conf.meta.koa.favicon));
app.use(bs());

//! main handler
app.use(async ctx => {
  if (conf.meta.app.debug) {
    console.debug(ctx.request);
  }

  let host = conf.meta.ui.noHost;

  if ('header' in ctx.request) {
    if ('x-forwarded-for' in ctx.request.header) {
      host = ctx.request.header['x-forwarded-for'];
    }
    else if ('host' in ctx.request.header) {
      host = ctx.request.header['host'];
    }
  }

  //? handle modify
  if (ctx.request.url === conf.meta.koa.editUrl) {
    if (ctx.req.method === 'GET') {
      ctx.type = 'html';
      ctx.status = 200;
      ctx.body = fs.createReadStream(__dirname + '/public/' + conf.meta.koa.editFile);
    }
    else {
      console.log(host + conf.meta.ui.request.post + JSON.stringify(ctx.request.body));

      let lname = '';
      let lvalue = '';

      if ('body' in ctx.request && 'lname' in ctx.request.body && 'lvalue' in ctx.request.body && isUri(ctx.request.body.lvalue)) {
        lname = ctx.request.body.lname.replace(/[^a-z0-9]/gi, '');

        if (ctx.request.body.lvalue.match(/^https?/i)) {
          lvalue = ctx.request.body.lvalue;
        }
      }

      if (lvalue === '' || lname === '') {
        ctx.status = conf.meta.koa.status.postFailed;
        ctx.body = conf.meta.ui.body.postFailed;
      }
      else {
        conf.data['/' + lname] = lvalue;

        if (conf.meta.app.debug) {
          console.log(conf.data);
        }

        fs.copyFileSync(cPath, cPathBak);
        fs.writeFileSync(cPath, yaml.stringify(conf));

        ctx.status = conf.meta.koa.status.post;
        ctx.body = conf.meta.ui.body.post;
        ctx.redirect('back');
      }
    }
  }
  //? list our...list
  else if (ctx.request.url === conf.meta.koa.listUrl) {
    ctx.type = 'json';
    ctx.status = conf.meta.koa.status.list;
    ctx.body = JSON.stringify(conf.data);
  }
  //? handle our list
  else if (ctx.request.url in conf.data) {
    const match = conf.data[ctx.request.url];

    console.log(host + conf.meta.ui.request.found + ctx.request.url);
    ctx.status = conf.meta.koa.status.redirect;
    ctx.body = conf.meta.ui.body.found + match;
    ctx.redirect(match);
  }
  //? send default response
  else {
    console.log(host + conf.meta.ui.request.notFound + ctx.request.url);
    ctx.status = conf.meta.koa.status.redirect;
    ctx.body = conf.meta.ui.body.notFound;
    ctx.redirect(conf.meta.koa.defaultUrl);
  }
});

//! let's go~
app.listen(conf.meta.app.port);
console.log(conf.meta.ui.running);
