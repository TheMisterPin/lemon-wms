/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/** Stop all tracks on a media stream. Safe to call with null/undefined. */
export function stopStream(stream?: MediaStream | null) {
  if (!stream) {
    return
  }
  stream.getTracks().forEach((track) => {
    try {
      track.stop()
    } catch (error) {
      // ignore
    }
  })
}
