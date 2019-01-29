#!/usr/bin/env node

"use strict";

/**
 * License: MIT © Sam Verschueren
 * https://github.com/SamVerschueren/alfred-link
 */

/* tslint:disable:no-console */

const path = require("path");
const makeDir = require("make-dir");
const pathExists = require("path-exists");
const readPkgUp = require("read-pkg-up");
const resolveAlfredPrefs = require("resolve-alfred-prefs");
const sudoBlock = require("sudo-block");
const plistTransform = require("alfred-link/lib/plist-transform");
const fs = require("fs");
const del = require("del");
const pify = require("pify");
const userHome = require("user-home");

// Prevent running as `sudo`
sudoBlock();

const getWorkflowDir = () => resolveAlfredPrefs().then(prefs => path.join(prefs, "workflows"));

const readPkg = workflowDir => pathExists(workflowDir)
  .then(workflowDirExists => {
    if (workflowDirExists) {
      return;
    }

    return resolveAlfredPrefs()
      .then(prefs => pathExists(prefs))
      .then(prefsExists => {
        if (!prefsExists) {
          throw new Error("`Alfred.alfredpreferences` package does not exist");
        }

        return makeDir(workflowDir);
      });
  })
  .then(() => readPkgUp());

const unlink = () => getWorkflowDir()
  .then(dir => readPkg(dir)
    .then(res => {
      const target = path.join(dir, res.pkg.name.replace("/", "-"));
      // Remove the symlink
      cleanup(target).then(removeLink(target));
    }),
  );

const removeLink = dir => del(path.join(dir), {force: true});

const fsP = pify(fs);

const idRegexp = /<key>bundleid<\/key>[\s]*<string>(.*?)<\/string>/;

// Cleanup config and cache data
const cleanup = dir => fsP.readFile(path.join(dir, "info.plist"), "utf8")
  .then(content => idRegexp.exec(content)[1])
  .then(bundleid => Promise.all([
    // We don't want to remove workflow config
    // removeLink(path.join(userHome, 'Library/Application Support/Alfred 3/Workflow Data', bundleid)),
    removeLink(path.join(userHome, "Library/Caches/com.runningwithcrayons.Alfred-3/Workflow Data", bundleid)),
  ]));

unlink().catch(error => {
  console.error(error);
  process.exit(1);
});
