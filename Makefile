name=$(shell /usr/libexec/PlistBuddy -c Print:name info.plist)

all: build open

open: bin/$(name).alfredworkflow
	open bin/$(name).alfredworkflow

build:
	-pushd .; zip -r FocusOnWork.alfredworkflow .; popd
