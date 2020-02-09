import Universe from './Universe'
import Renderer from './Renderer'
import { BrowserAnimator } from '../utils'
import { Nullable } from '../types'

export interface SimulatorOptions {
    frameRate?: number;
}

class Simulator {

    universe: Nullable<Universe>;
    renderer: Renderer;
    animator: BrowserAnimator;
    id: Nullable<number> = null;

    constructor(renderer: Renderer, universe: Nullable<Universe> = null, { frameRate = 30 }: SimulatorOptions = {}) {
        this.universe = universe
        this.renderer = renderer
        this.animator = new BrowserAnimator(this.loop, frameRate)
    }

    setUniverse(universe: Nullable<Universe>) {
        this.universe = universe
    }

    start = () => {
        this.animator.start()
    }

    stop = () => {
        this.animator.stop()
    }

    private loop = () => {
        if (this.universe) {
            this.renderer.drawFrame(this.universe)
            this.universe.tick()
        }
    }
    
}

export default Simulator