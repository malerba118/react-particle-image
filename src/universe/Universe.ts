import Subverse from './Subverse'
import { Bounds } from './types'

class Universe extends Subverse {
    
    constructor(bounds: Bounds) {
        super(null, bounds)
    }
    
}

export default Universe