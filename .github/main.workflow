workflow "Build and Test" {
  on = "push"
  resolves = [
    "Publish (Dry Run)"
  ]
}

action "Build" {
  uses = "actions/npm@master"
  args = "install"
}

action "Test" {
  needs = "Build"
  uses = "actions/npm@master"
  args = "test"
}

action "Publish (Dry Run)" {
  needs = "Test"
  uses = "actions/npm@master"
  args = "publish --dry-run"
}
