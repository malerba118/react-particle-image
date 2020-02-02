export type TimingFunction = (t: number) => number

type TimingFunctions = {
  [key: string]: TimingFunction
}

const timing: TimingFunctions = {
    linear: (t) => t,
    easeInQuad: (t) => t*t,
    easeOutQuad: t => t*(2-t),
    easeInOutQuad: t => t<.5 ? 2*t*t : -1+(4-2*t)*t,
    one: (t) => 1,
    zero: (t) => 0
  }

export default timing