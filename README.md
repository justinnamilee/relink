# relink
Simple URL redirection service, probably built in nodejs, likely configured with YAML cause JSON is ugly for humans.

# config.yml
Most of the options should be fairly self-explanatory.  To add new 'relinks' simply add another key to the `data` section of the file.

# Install & Running
- `git clone git@github.com:justinnamilee/relink.git`
- `npm install`
- `cp private/config.yml-example private/config.yml`
- `node relink.js`

# Traps for Young Players
If running behind a reverse proxy, be sure to enable the `x-forwarded-for` header for your reverse proxy.