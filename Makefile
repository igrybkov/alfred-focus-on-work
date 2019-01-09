BIN = ./node_modules/.bin
.PHONY: test clean

test:
	@npm test

release: test
	npm run release

release-patch: test
	npm run release -- --increment patch

release-minor: test
	npm run release -- --increment minor

release-major: test
	npm run release -- --increment minor

publish:
	git push
	git push --tags origin HEAD:master
	npm publish

link:
	./node_modules/alfred-link/link.js

unlink:
	./node_modules/alfred-link/unlink.js

alfredworkflow:
	$(eval name=$(shell /usr/libexec/PlistBuddy -c Print:name info.plist | sed -e 's/ //g'))
	$(eval archive=$(shell npm pack 2>&1 | tail -n1))
	rm -rf dist
	mkdir dist
	tar -xzf $(archive) -C dist
	rm -rf $(archive)
	cp package-lock.json dist/package/
	cd dist/package; npm ci --production --ignore-scripts
	cd dist/package; zip -r ../$(name).alfredworkflow .
	rm -rf dist/package
