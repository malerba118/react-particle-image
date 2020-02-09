import { ParticleOptions } from './ParticleImage'
import { TimingFunction } from '../universe/timing'
import { getImageData, shuffle, range } from '../utils'
import { Universe, UniverseState, PixelManager, Vector, Particle } from '../universe'
import { Dimensions } from '../types'

export interface ImageUniverseSetupResult {
    universe: Universe;
    pixelManagers: PixelManager[];
  }

export interface SetupOptions {
    url: string;
    maxParticles: number; 
    particleOptions: Required<ParticleOptions>;
    scale: number;
    canvasDimensions: Dimensions;
    creationDuration?: number;
    deathDuration?: number;
    creationTimingFn?: TimingFunction;
    deathTimingFn?: TimingFunction;
    onUniverseStateChange?: (state: UniverseState, universe: Universe) => void
  }
  
 const createImageUniverse = async ({url, maxParticles, particleOptions, scale, canvasDimensions, creationTimingFn, deathTimingFn, creationDuration, deathDuration, onUniverseStateChange}: SetupOptions): Promise<ImageUniverseSetupResult> => {
  
    const image = await getImageData(url)
    const imageHeight = image.getHeight()
    const imageWidth = image.getWidth()
    let numPixels = imageHeight * imageWidth
    let indexArray = shuffle(range(numPixels))
    let selectedPixels = 0
    const universe = new Universe({ 
      creationTimingFn, 
      deathTimingFn, 
      creationDuration, 
      deathDuration, 
      onStateChange: onUniverseStateChange
    })
    let pixelManagers: PixelManager[] = []
    maxParticles = Math.min(numPixels, maxParticles)
  
    while (selectedPixels < maxParticles && indexArray.length) {
        const nextIndex = indexArray.pop() || 0
        const x = nextIndex % imageWidth
        const y = Math.floor(nextIndex / imageWidth)
  
        let shouldCreateParticle: boolean = particleOptions.filter({x, y, image})

        if (shouldCreateParticle) {
            const subverse = universe.createSubverse()
  
            const pixelManager = new PixelManager({pixelX: x, pixelY: y, scale, imageHeight: image.getHeight(), imageWidth: image.getWidth(), canvasWidth: canvasDimensions.width, canvasHeight: canvasDimensions.height})
            pixelManagers.push(pixelManager)
            subverse.addParticleForce(pixelManager.getParticleForce())
  
            let color: string = particleOptions.color({x, y, image})
  
            let radius: number = particleOptions.radius({x, y, image})
  
            let friction: number = particleOptions.friction({x, y, image})

            let mass: number = particleOptions.mass({x, y, image})
  
            let position: Vector = particleOptions.initialPosition({x, y, image, finalPosition: pixelManager.getPixelPosition(), canvasDimensions})
  
            let velocity: Vector = particleOptions.initialVelocity({x, y, image})
  
            subverse.addParticle(new Particle({radius, mass, color, friction, position, velocity}))
            selectedPixels += 1
        }
  
    }
  
    return { universe, pixelManagers }
  }
  
  export default createImageUniverse