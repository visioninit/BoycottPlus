all:
	rm -f bin/*; \
	cd src; \
	zip -r ../bin/boycottplus.xpi *;