# relink

Simple URL redirection service, probably built in nodejs, likely configured with YAML cause JSON is ugly for humans.

## quick start

```bash

git clone https://github.com/justinnamilee/relink.git
npm install
cp private/config.yml-example private/config.yml
# modify the config as you see fit
node relink.js
```

> If running behind a reverse proxy, be sure to enable the `x-forwarded-for` header for your reverse proxy.

## config

Most of the options should be fairly self-explanatory for the `config.yml`.  To add new links simply add another key to the `data` section of the file.  Bingo-bongo.

## security

Note, this project is really for-fun, I would not deploy this without looking at the code first; eventually this will be updated and this notice removed.
