
import Universe from './Universe'

abstract class Renderer {
    abstract drawFrame(universe: Universe): void
}

export default Renderer