import test from 'ava'
import alfyTest from 'alfy-test'

test('Has Things app in the output ', async t => {
  const alfy = alfyTest()
  const result = await alfy('menu:tasklist')

  let hasThings = false

  for (const item of result) {
    hasThings = item.title === 'Things'
    if (hasThings) {
      break
    }
  }

  t.true(hasThings)
})

test('Has TaskPaper app in the output ', async t => {
  const alfy = alfyTest()
  const result = await alfy('menu:tasklist')

  let hasTaskPaper = false

  for (const item of result) {
    hasTaskPaper = item.title === 'TaskPaper'
    if (hasTaskPaper) {
      break
    }
  }

  t.true(hasTaskPaper)
})
