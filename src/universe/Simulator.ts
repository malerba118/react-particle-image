import Universe from './Universe'
import Renderer from './Renderer'
import { BrowserAnimator } from '../utils'
import { Nullable } from './types'

class Simulator {

    universe: Nullable<Universe>;
    renderer: Renderer;
    animator: BrowserAnimator;
    id: Nullable<number> = null;

    constructor(renderer: Renderer, universe: Nullable<Universe> = null) {
        this.universe = universe
        this.renderer = renderer
        this.animator = new BrowserAnimator(this.loop, 30)
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