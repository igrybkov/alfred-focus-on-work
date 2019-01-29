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
	-./tools/link.js

unlink:
	-./tools/unlink.js

switch-to-release: unlink
	$(eval packageName=$(shell node -e "try {var pack=require('./package.json'); console.log(pack.name); } catch(e) {}"))
	npm install -g $(packageName)

switch-to-dev:
	$(eval packageName=$(shell node -e "try {var pack=require('./package.json'); console.log(pack.name); } catch(e) {}"))
	npm remove -g $(packageName)
	make link


alfredworkflow:
	$(eval name=$(shell /usr/libexec/PlistBuddy -c Print:name info.plist | sed -e 's/ //g'))
	$(eval archive=$(shell npm pack 2>&1 | tail -n1))
	rm -rf build
	mkdir build
	tar -xzf $(archive) -C build
	rm -rf $(archive)
	cp package-lock.json build/package/
	cd build/package; npm ci --production --ignore-scripts
	cd build/package; zip -r ../$(name).alfredworkflow .
	rm -rf build/package
