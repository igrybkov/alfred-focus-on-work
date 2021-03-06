'use strict';
// @flow
import Application from '../app/application';

import { Registrator } from '../app/registrator';
import { GetTimeMenu } from '../events';

export default new Registrator(async (app: Application) => {
  app.on(GetTimeMenu.name, addTimeMenuItems, 100);
});

const addTimeMenuItems = async (event: GetTimeMenu) => {
  const maxTime = 12 * 60; // 8 hours
  const range = [];
  const convert = (n: number) => {
    // tslint:disable-next-line:no-bitwise
    const hours = parseInt(`${(n / 60) ^ 0}`.slice(-2), 10);
    const minutes = parseInt(`${n % 60}`.slice(-2), 10);
    let title = '';
    let subtitle = '';
    let match = '';
    if (hours !== 0) {
      if (hours === 1) {
        title += '1 hour';
      } else {
        title += `${hours} hours`;
      }
      subtitle += `${hours}h`;
    }

    if (minutes !== 0) {
      if (minutes === 1) {
        title += '1 minute';
      } else {
        title += ` ${minutes} minutes`;
      }
      subtitle += `${minutes}m`;
    }

    if (hours === 0 && minutes === 25) {
      subtitle += ' (Pomodoro session)';
      match += ' Pomodoro';
    }

    return {
      title: title.trim(),
      subtitle: subtitle.trim(),
      match: [title, subtitle, match].join(' '),
    };
  };
  for (let i = 2; i <= maxTime; ) {
    const data = convert(i);
    event.output.items.push({
      uid: `time_list_entry_${i}`,
      title: data.title,
      subtitle: data.subtitle,
      match: data.match,
      arg: i,
      icon: {
        path: 'images/time.png',
      },
      variables: {
        timeInMinutes: i,
      },
    });
    if (i === 2) {
      i = 5;
    } else if (i < 60) {
      i += 5;
    } else if (i < 180) {
      i += 10;
      // 6 hours
    } else if (i < 360) {
      i += 30;
    } else {
      i += 60;
    }
  }
};
