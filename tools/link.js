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
const fs = require("fs");
const plist = require("plist");
const del = require("del");
const pify = require("pify");
const userHome = require("user-home");
const fsP = pify(fs);

// Prevent running as `sudo`
sudoBlock();

const getWorkflowDir = () => resolveAlfredPrefs().then(prefs => path.join(prefs, "workflows"));

const readPkg = workflowDir => pathExists(workflowDir)
  .then(exists => {
    if (!exists) {
      throw new Error(`Workflow directory \`${workflowDir}\` does not exist`);
    }

    return readPkgUp();
  });

const link = opts => {
  const options = Object.assign({
    transform: true,
  }, opts);

  let workflowDir;

  return getWorkflowDir()
    .then(dir => {
      workflowDir = dir;

      return readPkg(dir);
    })
    .then(result => {
      const pkg = result.pkg;
      const filePath = result.path;

      const src = path.dirname(filePath);
      const dest = path.join(workflowDir, pkg.name.replace("/", "-"));

      if (!options.transform) {
        return linkDirectory(src, dest);
      }

      return plistTransform(path.dirname(filePath), pkg)
        .then(() => linkDirectory(src, dest));
    });
};

const linkDirectory = (src, dest) => del(dest, {force: true}).then(() => fsP.symlink(src, dest));

const plistTransform = (dir, pkg) => {
  const file = path.join(dir, "info.plist");

  return fsP.readFile(file, "utf8")
    .then(content => {
      const data = plistTransformFix(plist.parse(content));
      data.version = pkg.version || "";
      data.description = pkg.description || "";
      data.webaddress = pkg.homepage || pkg.author.url || "";
      data.createdby = pkg.author.name || "";

      return fsP.writeFile(file, plist.build(data));
    });
};

// Fixes some inconsistencies when running `plist.parse`
// https://github.com/TooTallNate/plist.js/issues/75
const plistTransformFix = obj => {
  for (const key of Object.keys(obj)) {
    const val = obj[key];

    if (val === null || val === undefined) {
      obj[key] = "";
    } else if (Array.isArray(val)) {
      obj[key] = val.map(plistTransformFix);
    } else if (typeof val === "object") {
      obj[key] = plistTransformFix(val);
    }
  }

  return obj;
};

const npmGlobal = process.env.npm_config_global;

if (npmGlobal === "") {
  // Prevent linking if the script was part of a non-global npm (install) command
  process.exit(0);
}

// Only transform if `alfred-link` is called from `npm -g`
link({
  transform: npmGlobal,
}).catch(err => {
  console.error(err);
  process.exit(1);
});
