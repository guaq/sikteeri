#!/bin/bash

for i in membership sikteeri ; do
	(cd $i && django-admin.py compilemessages)
done

echo "! (cd sikteeri && ./manage.py rebuild_index) is not considered harmful. !"
