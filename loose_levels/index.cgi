#! /usr/bin/env python

import cgi, cgitb, os
cgitb.enable ()

print """Content-type: text/html

<html>
<head>
<title>Fluvia Individual Levels</title>
<link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
<h1>Choose Level to Play</h1>
<ul>
"""

for filename in os.listdir ("."):
    if filename[-4:] == ".lvl":
        print ("<li><a href='../?level=%s'>%s</a></li>" % (filename, filename))

print """
</ul>
</body>
</html>
"""
