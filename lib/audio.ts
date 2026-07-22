import { Mp3Encoder } from '@breezystack/lamejs';

export function pcmToWav(pcmBase64: string, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): string {
  try {
    const pcmBuffer = Buffer.from(pcmBase64, 'base64');
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);

    // RIFF chunk descriptor
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);

    // fmt sub-chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);

    // data sub-chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    const wavBuffer = Buffer.concat([header, pcmBuffer]);
    return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting PCM to WAV:', error);
    return '';
  }
}

export function pcmToMp3(pcmBase64: string, sampleRate = 24000, numChannels = 1, kbps = 128): string {
  try {
    const pcmBuffer = Buffer.from(pcmBase64, 'base64');
    const mp3encoder = new Mp3Encoder(numChannels, sampleRate, kbps);
    
    // Convert Buffer to Int16Array
    const samples = new Int16Array(
      pcmBuffer.buffer,
      pcmBuffer.byteOffset,
      pcmBuffer.length / 2
    );

    const mp3Data: Uint8Array[] = [];
    const sampleBlockSize = 1152;

    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf));
    }

    const totalLength = mp3Data.reduce((acc, curr) => acc + curr.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of mp3Data) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    const base64Mp3 = Buffer.from(merged).toString('base64');
    return `data:audio/mp3;base64,${base64Mp3}`;
  } catch (error) {
    console.error('Error converting PCM to MP3:', error);
    return '';
  }
}

// Convert WAV data URL to MP3 data URL or download
export function wavToMp3DataUrl(wavDataUrl: string): string {
  if (!wavDataUrl) return '';
  if (wavDataUrl.startsWith('data:audio/mp3') || wavDataUrl.startsWith('data:audio/mpeg')) {
    return wavDataUrl;
  }
  try {
    const base64Part = wavDataUrl.split(',')[1];
    if (!base64Part) return wavDataUrl;
    const wavBuffer = Buffer.from(base64Part, 'base64');
    // Skip 44 bytes WAV header to extract raw PCM
    const pcmBuffer = wavBuffer.subarray(44);
    return pcmToMp3(pcmBuffer.toString('base64'), 24000, 1, 128);
  } catch (e) {
    console.error('Error converting WAV to MP3 data URL', e);
    return wavDataUrl;
  }
}
