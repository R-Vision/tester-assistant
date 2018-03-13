ta-web-server is a small webserver for Tester Assistant.

Copy ta-web-server to /etc/init.d/.
Make sure that it is executable.

====

And now you can start ta-web-server by:

> /etc/init.d/ta-web-server start

and stop xvfb by:

> /etc/init.d/ta-web-server stop

====

To start Xvfb automaticaly at boot time you can use:

> update-rc.d ta-web-server defaults 92

====
