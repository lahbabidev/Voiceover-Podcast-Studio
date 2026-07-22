/**
 * Helper to generate SRT & VTT subtitles for voiceovers
 */

export function generateSrtContent(scriptText: string, totalDurationSec: number = 10): string {
  // Split script into sentence chunks or lines
  const rawLines = scriptText
    .split(/([.!?\n]+|\u061B|\u061F)/) // Split by punctuation including Arabic semicolon/question mark
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^[.!?\u061B\u061F]+$/.test(s));

  if (rawLines.length === 0) {
    return `1\n00:00:00,000 --> 00:00:05,000\n${scriptText}\n`;
  }

  const totalChars = rawLines.reduce((acc, line) => acc + line.length, 0);
  let currentTime = 0;
  let srtOutput = '';

  rawLines.forEach((line, index) => {
    const lineRatio = totalChars > 0 ? line.length / totalChars : 1 / rawLines.length;
    const lineDuration = Math.max(1.5, totalDurationSec * lineRatio);
    const startTime = currentTime;
    const endTime = Math.min(totalDurationSec, currentTime + lineDuration);

    const formatSrtTime = (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);
      const millis = Math.floor((seconds % 1) * 1000);
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    };

    srtOutput += `${index + 1}\n${formatSrtTime(startTime)} --> ${formatSrtTime(endTime)}\n${line}\n\n`;
    currentTime = endTime;
  });

  return srtOutput.trim();
}

export function generateSrtDataUrl(scriptText: string, durationSec: number = 10): string {
  const srtText = generateSrtContent(scriptText, durationSec);
  const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
  return URL.createObjectURL(blob);
}
