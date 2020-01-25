import Subverse from './Subverse'
import { Bounds } from './types'

interface UniverseOptions {
    bounds?: Bounds
}

class Universe extends Subverse {
    
    constructor(options: UniverseOptions = {}) {
        super(null, options)
    }
    
}

export default Universe