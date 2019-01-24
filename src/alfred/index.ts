'use strict';

interface Icon {
  path: string;
}

interface Variables {
  [s: string]: string | number;
}

interface Modifier {
  valid: boolean;
  arg: string;
  subtitle: string;
  icon?: Icon;
  variables?: Variables;
}

interface Modifiers {
  alt?: Modifier;
  cmd?: Modifier;
  ctrl?: Modifier;
  shift?: Modifier;
}

interface MenuItem {
  uid?: string;
  title: string;
  valid?: boolean;
  match?: string;
  arg?: string | number;
  subtitle?: string;
  icon?: Icon;
  variables?: Variables;
}

export interface AlfredItem extends MenuItem {
  mods?: Modifiers;
}

export interface AlfredOutput {
  items: AlfredItemsSet;
  variables: Variables;
}

export type AlfredItemsSet = AlfredItem[];
