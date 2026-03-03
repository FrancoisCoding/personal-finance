const fs = require('fs')
const path = require('path')

const sampleRate = 44100
const durationSeconds = 52
const totalSamples = sampleRate * durationSeconds
const beatsPerMinute = 124
const beatDuration = 60 / beatsPerMinute
const barDuration = beatDuration * 4
const eighthDuration = beatDuration / 2
const outputPath = path.join(
  __dirname,
  '..',
  'public',
  'financeflow-pulse.wav'
)

const noteFrequencies = {
  A2: 110.0,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
}

const chordProgression = [
  ['A2', 'C3', 'E3', 'A3'],
  ['F3', 'A3', 'C4', 'E4'],
  ['C3', 'E3', 'G3', 'C4'],
  ['G3', 'B3', 'D4', 'G4'],
]

const bassPattern = ['A2', 'A2', 'F3', 'F3', 'C3', 'C3', 'G3', 'G3']
const hookPattern = ['E4', 'C4', 'A3', 'C4', 'E4', 'G4', 'E4', 'C4']
const accentPattern = ['A4', null, 'G4', null, 'E4', null, 'D4', null]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const sectionEnvelope = (
  time,
  fadeInStart,
  fadeInDuration,
  fadeOutEnd,
  fadeOutDuration
) => {
  const fadeIn = clamp((time - fadeInStart) / fadeInDuration, 0, 1)
  const fadeOut = clamp((fadeOutEnd - time) / fadeOutDuration, 0, 1)
  return Math.min(fadeIn, fadeOut)
}

const renderKick = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.24) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 16)
  const pitch = 128 - timeSinceBeat * 300
  const click =
    Math.sin(2 * Math.PI * 1200 * timeSinceBeat) *
    Math.exp(-timeSinceBeat * 90) *
    0.08

  return Math.sin(2 * Math.PI * pitch * timeSinceBeat) * envelope * 0.96 + click
}

const renderClap = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.16) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 28)
  const texture =
    Math.sin(2 * Math.PI * 980 * timeSinceBeat) * 0.16 +
    Math.sin(2 * Math.PI * 1560 * timeSinceBeat) * 0.12

  return texture * envelope * 0.18
}

const renderHat = (timeSinceHit) => {
  if (timeSinceHit < 0 || timeSinceHit > 0.05) {
    return 0
  }

  const envelope = Math.exp(-timeSinceHit * 82)
  const texture =
    Math.sin(2 * Math.PI * 2800 * timeSinceHit) * 0.06 +
    Math.sin(2 * Math.PI * 4200 * timeSinceHit) * 0.03

  return texture * envelope * 0.06
}

const renderBass = (time, beatIndex, energy) => {
  const noteName = bassPattern[beatIndex % bassPattern.length]
  const frequency = noteFrequencies[noteName]
  const localTime = time % beatDuration
  const envelope = Math.exp(-localTime * 4.8) * energy * 0.28

  return (
    Math.sin(2 * Math.PI * frequency * time) * envelope +
    Math.sin(2 * Math.PI * frequency * 0.5 * time) * envelope * 0.32 +
    Math.sin(2 * Math.PI * frequency * 2 * time) * envelope * 0.08
  )
}

const renderPad = (time, barIndex, energy, sidechain) => {
  const chord = chordProgression[barIndex % chordProgression.length]
  const localTime = time % barDuration
  const attack = clamp(localTime / 0.32, 0, 1)
  const release = clamp((barDuration - localTime) / 0.48, 0, 1)
  const envelope = Math.min(attack, release) * energy * sidechain * 0.18

  return chord.reduce((sum, noteName, index) => {
    const frequency = noteFrequencies[noteName]
    const voice =
      Math.sin(2 * Math.PI * frequency * time) * 0.48 +
      Math.sin(2 * Math.PI * frequency * 2 * time) * 0.08

    return sum + voice * envelope * (index === 0 ? 1 : 0.72)
  }, 0)
}

const renderChordStab = (time, beatIndex, barIndex, energy) => {
  const chord = chordProgression[barIndex % chordProgression.length]
  const localTime = time % beatDuration
  const envelope = Math.exp(-localTime * 9.5) * energy * 0.14

  return chord.reduce((sum, noteName) => {
    const frequency = noteFrequencies[noteName]
    const voice =
      Math.sin(2 * Math.PI * frequency * time) * 0.34 +
      Math.sin(2 * Math.PI * frequency * 3 * time) * 0.05

    return sum + voice * envelope
  }, 0)
}

const renderHook = (time, eighthIndex, energy, sidechain) => {
  const noteName = hookPattern[eighthIndex % hookPattern.length]
  const frequency = noteFrequencies[noteName]
  const localTime = time % eighthDuration
  const envelope = Math.exp(-localTime * 6.8) * energy * sidechain * 0.16

  return (
    Math.sin(2 * Math.PI * frequency * time) * envelope +
    Math.sin(2 * Math.PI * frequency * 2 * time) * envelope * 0.16
  )
}

const renderAccent = (time, eighthIndex, energy) => {
  const noteName = accentPattern[eighthIndex % accentPattern.length]
  if (!noteName) {
    return 0
  }

  const frequency = noteFrequencies[noteName]
  const localTime = time % eighthDuration
  const envelope = Math.exp(-localTime * 9) * energy * 0.06

  return Math.sin(2 * Math.PI * frequency * time) * envelope
}

const samples = new Int16Array(totalSamples)

for (let index = 0; index < totalSamples; index += 1) {
  const time = index / sampleRate
  const beatIndex = Math.floor(time / beatDuration)
  const barIndex = Math.floor(beatIndex / 4)
  const eighthIndex = Math.floor(time / eighthDuration)
  const timeSinceBeat = time - beatIndex * beatDuration
  const timeSinceEighth = time - eighthIndex * eighthDuration

  const introEnergy = sectionEnvelope(time, 0, 4, durationSeconds, 8)
  const grooveEnergy = sectionEnvelope(time, 2.5, 4, durationSeconds, 6)
  const hookEnergy = sectionEnvelope(time, 1.2, 5, durationSeconds, 6)
  const liftEnergy = sectionEnvelope(time, 24, 8, durationSeconds, 4)
  const finaleEnergy = sectionEnvelope(time, 40, 5, durationSeconds, 3)
  const sidechain = 0.72 + 0.28 * clamp(timeSinceBeat / 0.14, 0, 1)

  const kick = renderKick(timeSinceBeat) * grooveEnergy
  const clap =
    beatIndex % 4 === 1 || beatIndex % 4 === 3
      ? renderClap(timeSinceBeat) * grooveEnergy
      : 0
  const hat =
    eighthIndex % 2 === 1 ? renderHat(timeSinceEighth) * grooveEnergy : 0
  const bass = renderBass(time, beatIndex, grooveEnergy)
  const pad = renderPad(time, barIndex, introEnergy, sidechain)
  const chordStab = renderChordStab(
    time,
    beatIndex,
    barIndex,
    introEnergy * 0.78 + grooveEnergy * 0.32
  )
  const hook = renderHook(
    time,
    eighthIndex,
    hookEnergy * 0.9 + finaleEnergy * 0.18,
    sidechain
  )
  const accent = renderAccent(time, eighthIndex, liftEnergy * 0.7 + finaleEnergy * 0.3)

  const mixed = clamp(kick + clap + hat + bass + pad + chordStab + hook + accent, -1, 1)
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
