import Universe from './Universe'
import Renderer from './Renderer'

class Simulator {

    universe: Universe;
    renderer: Renderer;
    simulating: boolean = false;

    constructor(universe: Universe, renderer: Renderer) {
        this.universe = universe
        this.renderer = renderer
    }

    start = () => {
        if (!this.simulating) {
            this.simulating = true
            this.tick()
        }
    }

    stop = () => {
        this.simulating = false
    }

    private tick = () => {
        this.renderer.clear()
        this.universe.getParticles().forEach((particle) => {
            this.renderer.drawParticle(particle)
        })
        this.universe.tick()
        window.requestAnimationFrame(this.simulating ? this.tick : () => {});
    }
    
}

export default Simulator