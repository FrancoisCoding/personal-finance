const fs = require('fs')
const path = require('path')

const sampleRate = 44100
const durationSeconds = 52
const totalSamples = sampleRate * durationSeconds
const beatsPerMinute = 134
const beatDuration = 60 / beatsPerMinute
const barDuration = beatDuration * 4
const sixteenthDuration = beatDuration / 4
const outputPath = path.join(
  __dirname,
  '..',
  'public',
  'financeflow-pulse.wav'
)

const noteFrequencies = {
  C2: 65.41,
  C3: 130.81,
  D2: 73.42,
  D3: 146.83,
  E2: 82.41,
  E3: 164.81,
  E4: 329.63,
  Fs3: 185.0,
  Fs4: 369.99,
  G2: 98.0,
  G3: 196.0,
  G4: 392.0,
  A3: 220.0,
  A4: 440.0,
  B3: 246.94,
  B4: 493.88,
  C4: 261.63,
  D4: 293.66,
  D5: 587.33,
}

const padProgression = [
  ['E3', 'B3', 'E4', 'G4'],
  ['C3', 'G3', 'C4', 'E4'],
  ['G3', 'D4', 'G4', 'B4'],
  ['D3', 'A3', 'D4', 'Fs4'],
]

const bassPattern = ['E2', 'C2', 'G2', 'D2']
const pluckPattern = ['E4', 'G4', 'B4', 'D5', 'B4', 'G4', 'A4', 'G4']
const leadPattern = ['E4', 'G4', 'B4', 'A4', 'G4', 'E4', 'D4', 'B3']

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const mixSection = (time, startTime, fadeInDuration, endTime, fadeOutDuration) => {
  const fadeIn = clamp((time - startTime) / fadeInDuration, 0, 1)
  const fadeOut = clamp((endTime - time) / fadeOutDuration, 0, 1)
  return Math.min(fadeIn, fadeOut)
}

const renderKick = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.24) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 16)
  const pitch = 136 - timeSinceBeat * 340
  const click = Math.sin(2 * Math.PI * 1800 * timeSinceBeat) * Math.exp(-timeSinceBeat * 120) * 0.16
  return (
    Math.sin(2 * Math.PI * pitch * timeSinceBeat) * envelope * 0.95 +
    click
  )
}

const renderClap = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.18) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 26)
  const noise =
    Math.sin(2 * Math.PI * 1400 * timeSinceBeat) * 0.3 +
    Math.sin(2 * Math.PI * 2300 * timeSinceBeat) * 0.24 +
    Math.sin(2 * Math.PI * 3100 * timeSinceBeat) * 0.12

  return noise * envelope * 0.3
}

const renderHat = (timeSinceHit, openAmount) => {
  if (timeSinceHit < 0 || timeSinceHit > 0.09) {
    return 0
  }

  const decay = openAmount > 0.5 ? 38 : 72
  const envelope = Math.exp(-timeSinceHit * decay)
  const noise =
    Math.sin(2 * Math.PI * 5200 * timeSinceHit) * 0.18 +
    Math.sin(2 * Math.PI * 7600 * timeSinceHit) * 0.12 +
    Math.sin(2 * Math.PI * 9800 * timeSinceHit) * 0.08

  return noise * envelope * 0.18
}

const renderPad = (time, barIndex, energy, beatDuck) => {
  const chord = padProgression[barIndex % padProgression.length]
  const localTime = time % barDuration
  const attack = clamp(localTime / 0.3, 0, 1)
  const release = clamp((barDuration - localTime) / 0.5, 0, 1)
  const envelope = Math.min(attack, release) * energy * beatDuck * 0.22

  return chord.reduce((sum, note, index) => {
    const frequency = noteFrequencies[note]
    const voice =
      Math.sin(2 * Math.PI * frequency * time) * 0.52 +
      Math.sin(2 * Math.PI * frequency * 2 * time) * 0.12 +
      Math.sin(2 * Math.PI * frequency * 0.5 * time) * 0.08
    return sum + voice * envelope * (index === 0 ? 1 : 0.7)
  }, 0)
}

const renderBass = (time, beatIndex, energy) => {
  const note = noteFrequencies[bassPattern[Math.floor(beatIndex / 4) % bassPattern.length]]
  const localTime = time % beatDuration
  const envelope = Math.exp(-localTime * 4.4) * energy * 0.34

  return (
    Math.sin(2 * Math.PI * note * time) * envelope +
    Math.sin(2 * Math.PI * note * 2 * time) * envelope * 0.18 +
    Math.sin(2 * Math.PI * note * 0.5 * time) * envelope * 0.32
  )
}

const renderPluck = (time, sixteenthIndex, energy) => {
  const note = noteFrequencies[pluckPattern[sixteenthIndex % pluckPattern.length]]
  const localTime = time % sixteenthDuration
  const envelope = Math.exp(-localTime * 14) * energy * 0.14

  return (
    Math.sin(2 * Math.PI * note * time) * envelope +
    Math.sin(2 * Math.PI * note * 2 * time) * envelope * 0.22
  )
}

const renderLead = (time, eighthIndex, energy) => {
  const note = noteFrequencies[leadPattern[eighthIndex % leadPattern.length]]
  const localTime = time % (beatDuration / 2)
  const envelope = Math.exp(-localTime * 5.4) * energy * 0.18
  const vibrato = 1 + Math.sin(2 * Math.PI * 5 * time) * 0.004

  return (
    Math.sin(2 * Math.PI * note * vibrato * time) * envelope +
    Math.sin(2 * Math.PI * note * 1.5 * time) * envelope * 0.18
  )
}

const renderRiser = (timeInBar, barIndex, energy) => {
  if (barIndex % 8 !== 7 || timeInBar < barDuration * 0.58) {
    return 0
  }

  const localTime = timeInBar - barDuration * 0.58
  const envelope = clamp(localTime / (barDuration * 0.42), 0, 1) * energy * 0.16
  const sweepFrequency = 260 + localTime * 920
  return Math.sin(2 * Math.PI * sweepFrequency * localTime) * envelope
}

const samples = new Int16Array(totalSamples)

for (let index = 0; index < totalSamples; index += 1) {
  const time = index / sampleRate
  const beatIndex = Math.floor(time / beatDuration)
  const barIndex = Math.floor(beatIndex / 4)
  const eighthIndex = Math.floor(time / (beatDuration / 2))
  const sixteenthIndex = Math.floor(time / sixteenthDuration)
  const timeSinceBeat = time - beatIndex * beatDuration
  const timeSinceSixteenth = time - sixteenthIndex * sixteenthDuration
  const timeInBar = time - barIndex * barDuration

  const introEnergy = mixSection(time, 0, 4, durationSeconds, 10)
  const grooveEnergy = mixSection(time, 2.5, 4, durationSeconds, 8)
  const leadEnergy = mixSection(time, 10, 6, durationSeconds - 2, 8)
  const liftEnergy = mixSection(time, 27, 6, durationSeconds, 4)
  const finaleEnergy = mixSection(time, 42, 4, durationSeconds, 3)
  const beatDuck = 0.68 + 0.32 * clamp(timeSinceBeat / 0.12, 0, 1)

  const kick = renderKick(timeSinceBeat) * (grooveEnergy > 0.1 ? 1 : 0.6)
  const clap =
    beatIndex % 4 === 1 || beatIndex % 4 === 3
      ? renderClap(timeSinceBeat) * grooveEnergy
      : 0
  const hat =
    sixteenthIndex % 2 === 1
      ? renderHat(timeSinceSixteenth, liftEnergy) * grooveEnergy
      : 0
  const pad = renderPad(time, barIndex, introEnergy, beatDuck)
  const bass = renderBass(time, beatIndex, grooveEnergy)
  const pluck = renderPluck(time, sixteenthIndex, introEnergy * 0.8 + grooveEnergy * 0.35)
  const lead = renderLead(
    time,
    eighthIndex,
    leadEnergy * 0.9 + liftEnergy * 0.34 + finaleEnergy * 0.22
  )
  const riser = renderRiser(timeInBar, barIndex, liftEnergy)
  const shimmer =
    Math.sin(2 * Math.PI * (0.09 + (barIndex % 5) * 0.008) * time) *
    (0.02 + liftEnergy * 0.01)

  const mixed = clamp(
    kick + clap + hat + pad + bass + pluck + lead + riser + shimmer,
    -1,
    1
  )
  samples[index] = Math.floor(mixed * 32767)
}

const byteRate = sampleRate * 2
const blockAlign = 2
const dataSize = samples.length * 2
const buffer = Buffer.alloc(44 + dataSize)

buffer.write('RIFF', 0)
buffer.writeUInt32LE(36 + dataSize, 4)
buffer.write('WAVE', 8)
buffer.write('fmt ', 12)
buffer.writeUInt32LE(16, 16)
buffer.writeUInt16LE(1, 20)
buffer.writeUInt16LE(1, 22)
buffer.writeUInt32LE(sampleRate, 24)
buffer.writeUInt32LE(byteRate, 28)
buffer.writeUInt16LE(blockAlign, 32)
buffer.writeUInt16LE(16, 34)
buffer.write('data', 36)
buffer.writeUInt32LE(dataSize, 40)

for (let index = 0; index < samples.length; index += 1) {
  buffer.writeInt16LE(samples[index], 44 + index * 2)
}

fs.writeFileSync(outputPath, buffer)
console.log(`Generated ${outputPath}`)
