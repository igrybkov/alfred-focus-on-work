'use strict'

exports.getList = () => {
  const maxTime = 12 * 60 // 8 hours
  const range = []
  const convert = n => {
    const hours = parseInt(`${n / 60 ^ 0}`.slice(-2), 10)
    const minutes = parseInt(`${n % 60}`.slice(-2), 10)
    let title = ''
    let subtitle = ''
    let match = ''
    if (hours !== 0) {
      if (hours === 1) {
        title += '1 hour'
      } else {
        title += `${hours} hours`
      }
      subtitle += `${hours}h`
    }

    if (minutes !== 0) {
      if (minutes === 1) {
        title += '1 minute'
      } else {
        title += ` ${minutes} minutes`
      }
      subtitle += `${minutes}m`
    }

    if (hours === 0 && minutes === 25) {
      subtitle += ` (Pomodoro session)`
      match += ` Pomodoro`
    }

    return {
      title: title.trim(),
      subtitle: subtitle.trim(),
      match: [title, subtitle, match].join(' ')
    }
  }
  for (let i = 2; i <= maxTime;) {
    const data = convert(i)
    range.push(
      {
        uid: `time_list_entry_${i}`,
        title: data.title,
        subtitle: data.subtitle,
        match: data.match,
        arg: i,
        icon: {
          path: 'images/time.png'
        },
        variables: {
          time: i
        }
      }
    )
    if (i === 2) {
      i = 5
    } else if (i < 30) {
      i += 5
    } else if (i === 30) {
      i = 40
    } else if (i === 40) {
      i = 45
    } else if (i < 180) {
      i += 15
      // 6 hours
    } else if (i < 360) {
      i += 30
    } else {
      i += 60
    }
  }
  return range
}
