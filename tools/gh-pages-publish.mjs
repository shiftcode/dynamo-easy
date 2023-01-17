import { cd, exec, echo, touch } from 'shelljs'
import { readFileSync } from 'node:fs'
import url from 'node:url'

const info = {
  TRAVIS_BRANCH: process.env.TRAVIS_BRANCH,
  TRAVIS_PULL_REQUEST: process.env.TRAVIS_PULL_REQUEST,
  TRAVIS_PULL_REQUEST_BRANCH: process.env.TRAVIS_PULL_REQUEST_BRANCH,
}
echo(`running on branch ${JSON.stringify(info)}`)

if (info.TRAVIS_BRANCH === 'master' && info.TRAVIS_PULL_REQUEST === 'false') {
  const pkg = JSON.parse(readFileSync('package.json'))
  let repoUrl
  if (typeof pkg.repository === 'object') {
    if (!pkg.repository.hasOwnProperty('url')) {
      throw new Error('URL does not exist in repository section')
    }
    repoUrl = pkg.repository.url
  } else {
    repoUrl = pkg.repository
  }

  const parsedUrl = url.parse(repoUrl)
  const repository = (parsedUrl.host || '') + (parsedUrl.path || '')
  const ghToken = process.env.GH_TOKEN

  echo('Deploying docs!!!')
  cd('dist/docs')
  touch('.nojekyll')
  exec('git init')
  exec('git add .')
  exec('git config user.name "Michael Wittwer"')
  exec('git config user.email "michael.wittwer@shiftcode.ch"')
  exec('git commit -m "docs(docs): update gh-pages"')
  exec(
    `git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`
  )
  echo('Docs deployed!!')
} else {
  echo('Not running on master -> skipping docs deployment')
}
