const { execFileSync } = require('child_process')
const fs = require('fs')

const forbiddenPathRules = [
  {
    name: 'Tracked .env files are not allowed',
    test: (filePath) =>
      /^\.env$/i.test(filePath) || /^\.env\.(?!example$).+/i.test(filePath),
  },
  {
    name: 'Tracked files in secrets/ are not allowed',
    test: (filePath) => /^secrets\/.+/i.test(filePath),
  },
  {
    name: 'Tracked key material files are not allowed',
    test: (filePath) => /\.(pem|key|p12|pfx)$/i.test(filePath),
  },
]

const forbiddenContentRules = [
  {
    name: 'Private key material detected',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  },
  {
    name: 'Potential OpenRouter API key detected',
    regex: /OPENROUTER_API_KEY\s*[:=]\s*['"]?sk-[A-Za-z0-9]{20,}/i,
  },
]

const runGitCommand = (args) => {
  const gitExecutableCandidates = [
    'git',
    'C:\\Program Files\\Git\\cmd\\git.exe',
    'C:\\Program Files\\Git\\bin\\git.exe',
  ]

  for (const executable of gitExecutableCandidates) {
    try {
      return execFileSync(executable, args, { encoding: 'utf8' })
    } catch {
      continue
    }
  }

  throw new Error('Unable to run git. Ensure git is installed and on PATH.')
}

const getTrackedFiles = () => {
  const output = runGitCommand(['ls-files'])
  return output
    .split(/\r?\n/)
    .map((filePath) => filePath.trim())
    .filter(Boolean)
}

const collectFindings = () => {
  const findings = []
  const trackedFiles = getTrackedFiles()

  trackedFiles.forEach((filePath) => {
    const normalizedPath = filePath.replace(/\\/g, '/')

    forbiddenPathRules.forEach((rule) => {
      if (rule.test(normalizedPath)) {
        findings.push(`${normalizedPath}: ${rule.name}`)
      }
    })

    let fileContents = ''
    try {
      fileContents = fs.readFileSync(filePath, 'utf8')
    } catch {
      return
    }

    forbiddenContentRules.forEach((rule) => {
      if (rule.regex.test(fileContents)) {
        findings.push(`${normalizedPath}: ${rule.name}`)
      }
    })
  })

  return findings
}

const findings = collectFindings()

if (findings.length > 0) {
  console.error('Secret scan failed.')
  findings.forEach((finding) => console.error(`- ${finding}`))
  process.exit(1)
}

console.log('Secret scan passed.')
