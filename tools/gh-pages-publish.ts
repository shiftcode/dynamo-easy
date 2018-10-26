const { cd, exec, echo, touch } = require('shelljs')
const { readFileSync } = require('fs')
const url = require('url')

const branchName = process.env.TRAVIS_BRANCH
echo(`running on branch ${branchName}`)

if (branchName === 'master') {
  const pkg = JSON.parse(readFileSync('package.json') as any)
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
  echo('Not running on master, therefor docs are not deployed')
}
