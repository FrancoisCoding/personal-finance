const fs = require('fs')
const path = require('path')

const sampleRate = 44100
const durationSeconds = 48
const totalSamples = sampleRate * durationSeconds
const beatDuration = 60 / 126
const outputPath = path.join(__dirname, '..', 'public', 'financeflow-pulse.wav')

const noteFrequencies = {
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
  G4: 392.0,
}

const padProgression = [
  ['C3', 'G3', 'C4', 'E4'],
  ['A3', 'E4', 'C4', 'E4'],
  ['F3', 'C4', 'A3', 'C4'],
  ['G3', 'D4', 'B3', 'D4'],
]

const arpPattern = ['E4', 'G4', 'C4', 'D4', 'E4', 'G4', 'D4', 'C4']
const bassPattern = ['C3', 'A3', 'F3', 'G3']

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

const renderKick = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.22) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 20)
  const frequency = 122 - timeSinceBeat * 280
  return Math.sin(2 * Math.PI * frequency * timeSinceBeat) * envelope * 0.95
}

const renderSnare = (timeSinceBeat) => {
  if (timeSinceBeat < 0 || timeSinceBeat > 0.16) {
    return 0
  }

  const envelope = Math.exp(-timeSinceBeat * 26)
  const noise =
    Math.sin(2 * Math.PI * 1800 * timeSinceBeat) * 0.35 +
    Math.sin(2 * Math.PI * 920 * timeSinceBeat) * 0.2 +
    (Math.random() * 2 - 1) * 0.45

  return noise * envelope * 0.34
}

const renderHat = (timeSinceHit) => {
  if (timeSinceHit < 0 || timeSinceHit > 0.05) {
    return 0
  }

  const envelope = Math.exp(-timeSinceHit * 70)
  const noise =
    Math.sin(2 * Math.PI * 4800 * timeSinceHit) * 0.18 +
    Math.sin(2 * Math.PI * 6200 * timeSinceHit) * 0.15 +
    (Math.random() * 2 - 1) * 0.25

  return noise * envelope * 0.22
}

const renderPad = (time, chordIndex) => {
  const chord = padProgression[chordIndex % padProgression.length]
  const localTime = time % (beatDuration * 4)
  const attack = Math.min(localTime / 0.22, 1)
  const release = Math.min((beatDuration * 4 - localTime) / 0.45, 1)
  const envelope = clamp(Math.min(attack, release), 0, 1) * 0.24

  return chord.reduce((sum, note, index) => {
    const frequency = noteFrequencies[note]
    const voice =
      Math.sin(2 * Math.PI * frequency * time) * 0.55 +
      Math.sin(2 * Math.PI * frequency * 2 * time) * 0.08
    return sum + voice * envelope * (index === 0 ? 1 : 0.7)
  }, 0)
}

const renderBass = (time, beatIndex) => {
  const note = noteFrequencies[bassPattern[Math.floor(beatIndex / 4) % bassPattern.length]]
  const localTime = time % beatDuration
  const envelope = Math.exp(-localTime * 3.2) * 0.28
  return (
    Math.sin(2 * Math.PI * note * time) * envelope +
    Math.sin(2 * Math.PI * note * 0.5 * time) * envelope * 0.45
  )
}

const renderArp = (time, eighthIndex) => {
  const note = noteFrequencies[arpPattern[eighthIndex % arpPattern.length]]
  const localTime = time % (beatDuration / 2)
  const envelope = Math.exp(-localTime * 10) * 0.18

  return (
    Math.sin(2 * Math.PI * note * time) * envelope +
    Math.sin(2 * Math.PI * note * 1.5 * time) * envelope * 0.24
  )
}

const samples = new Int16Array(totalSamples)

for (let index = 0; index < totalSamples; index += 1) {
  const time = index / sampleRate
  const beatIndex = Math.floor(time / beatDuration)
  const barIndex = Math.floor(beatIndex / 4)
  const eighthIndex = Math.floor(time / (beatDuration / 2))
  const timeSinceBeat = time - beatIndex * beatDuration
  const timeSinceEighth = time - eighthIndex * (beatDuration / 2)

  const kick = renderKick(timeSinceBeat)
  const snare =
    beatIndex % 4 === 1 || beatIndex % 4 === 3 ? renderSnare(timeSinceBeat) : 0
  const hat = renderHat(timeSinceEighth)
  const pad = renderPad(time, barIndex)
  const bass = renderBass(time, beatIndex)
  const arp = renderArp(time, eighthIndex)

  const sweep =
    Math.sin(2 * Math.PI * (0.08 + (barIndex % 6) * 0.01) * time) * 0.02

  const mixed = clamp(kick + snare + hat + pad + bass + arp + sweep, -1, 1)
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
