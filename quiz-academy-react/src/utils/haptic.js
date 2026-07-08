/**
 * Haptic feedback via Web Vibration API
 * Silently fails on devices that don't support it
 */

export function hapticLight()   { navigator.vibrate?.(10) }
export function hapticMedium()  { navigator.vibrate?.(30) }
export function hapticSuccess() { navigator.vibrate?.([10, 50, 10]) }
export function hapticError()   { navigator.vibrate?.([50, 30, 50]) }
export function hapticWin()     { navigator.vibrate?.([30, 20, 30, 20, 80]) }
