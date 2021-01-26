import Application from '../app/application';

import { Registrator } from '../app/registrator';
import {
  GetMainMenu,
  SetConfigurationValue,
  ShowSettingOptions,
  ShowSettingsItems,
} from '../events';

export default new Registrator(async (app: Application) => {
  app.on(GetMainMenu.name, addSettingsToMainMenu, 900);
  app.on(ShowSettingsItems.name, ShowSettingsInMainMenu, 900);
  app.on(ShowSettingOptions.name, ShowSettingsInMainMenuOptions);
  app.on(SetConfigurationValue.name, setConfigurationValue);
});

const CONF_SHOW_IN_MAIN_MENU = 'settings.settings.show_in_main_menu';

const ShowSettingsInMainMenu = async (
  event: ShowSettingsItems,
  app: Application,
) => {
  event.output.items.push({
    title: 'Show settings in main menu',
    subtitle: 'Settings also available under keyword "fow:settings"',
    arg: isShowSettingsInMainMenu(app) ? 'Yes' : 'No',
    variables: {
      settingPath: CONF_SHOW_IN_MAIN_MENU,
    },
  });
};

const isShowSettingsInMainMenu = (app: Application) => {
  const confValue = app.config.get(CONF_SHOW_IN_MAIN_MENU);
  if (confValue === undefined) {
    return true;
  }
  return confValue === '1';
};

const ShowSettingsInMainMenuOptions = async (
  event: ShowSettingOptions,
  app: Application,
) => {
  event.output.items.push({
    title: 'Yes, show settings in main menu',
    subtitle: 'Settings also available under keyword "fow:settings"',
    arg: 'setting-set-value',
    variables: {
      settingPath: CONF_SHOW_IN_MAIN_MENU,
      settingValue: '1',
    },
  });
  event.output.items.push({
    title: 'No, hide settings from main menu',
    subtitle: 'Settings also available under keyword "fow:settings"',
    arg: 'setting-set-value',
    variables: {
      settingPath: CONF_SHOW_IN_MAIN_MENU,
      settingValue: '0',
    },
  });
};
const addSettingsToMainMenu = async (event: GetMainMenu, app: Application) => {
  if (!isShowSettingsInMainMenu(app)) {
    return;
  }
  event.output.items.push({
    title: 'Settings',
    subtitle: 'Show workflow settings',
    arg: 'settings',
    icon: {
      path: 'images/settings-icon.png',
    },
  });
};

const setConfigurationValue = async (
  event: SetConfigurationValue,
  app: Application,
) => {
  app.config.set(event.settingPath, event.settingValue);
};
