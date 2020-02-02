import { ParticleOptions } from './ParticleImage'
import { TimingFunction } from '../universe/timing'
import { getImageData, shuffle, range } from '../utils'
import { Universe, PixelManager, Vector, Particle } from '../universe'

export interface ImageUniverseSetupResult {
    universe: Universe;
    pixelManagers: PixelManager[];
  }

export interface SetupOptions {
    url: string;
    maxParticles: number; 
    particleOptions: Required<ParticleOptions>;
    scale: number;
    canvasWidth: number;
    canvasHeight: number;
    creationDuration?: number;
    deathDuration?: number;
    creationTimingFn?: TimingFunction;
    deathTimingFn?: TimingFunction;
  }
  
 const createImageUniverse = async ({url, maxParticles, particleOptions, scale, canvasWidth, canvasHeight, creationTimingFn, deathTimingFn, creationDuration, deathDuration}: SetupOptions): Promise<ImageUniverseSetupResult> => {
  
    const image = await getImageData(url)
    const imageHeight = image.height()
    const imageWidth = image.width()
    let numPixels = imageHeight * imageWidth
    let indexArray = shuffle(range(numPixels))
    let selectedPixels = 0
    const universe = new Universe({ creationTimingFn, deathTimingFn, creationDuration, deathDuration })
    let pixelManagers: PixelManager[] = []
    maxParticles = Math.min(numPixels, maxParticles)
  
    while (selectedPixels < maxParticles && indexArray.length) {
        const nextIndex = indexArray.pop() || 0
        const x = nextIndex % imageWidth
        const y = Math.floor(nextIndex / imageWidth)
  
        let shouldCreateParticle: boolean = particleOptions.filter({x, y, image})

        if (shouldCreateParticle) {
            const subverse = universe.createSubverse()
  
            const pixelManager = new PixelManager({pixelX: x, pixelY: y, scale, imageHeight: image.height(), imageWidth: image.width(), canvasHeight, canvasWidth})
            pixelManagers.push(pixelManager)
            subverse.addParticleForce(pixelManager.getParticleForce())
  
            let color: string = particleOptions.color({x, y, image})
  
            let radius: number = particleOptions.radius({x, y, image})
  
            let friction: number = particleOptions.friction({x, y, image})

            let mass: number = particleOptions.mass({x, y, image})
  
            let position: Vector = particleOptions.initialPosition({x, y, image, finalPosition: pixelManager.getPixelPosition()})
  
            let velocity: Vector = particleOptions.initialVelocity({x, y, image})
  
            subverse.addParticle(new Particle({radius, mass, color, friction, position, velocity}))
            selectedPixels += 1
        }
  
    }
  
    return { universe, pixelManagers }
  }
  
  export default createImageUniverse