import * as forces from "./forces";
import ParticleForce from "./ParticleForce";
import Particle from "./Particle";
import Vector from "./Vector";

interface PixelManagerOptions {
    pixelX: number; 
    pixelY: number; 
    scale: number; 
    imageWidth: number; 
    imageHeight: number; 
    canvasWidth: number; 
    canvasHeight: number;
}

class PixelManager {

    pixelX: number; 
    pixelY: number; 
    scale: number; 
    imageWidth: number; 
    imageHeight: number; 
    canvasWidth: number; 
    canvasHeight: number;

    constructor(options: PixelManagerOptions) {
        this.pixelX = options.pixelX 
        this.pixelY = options.pixelY 
        this.scale = options.scale
        this.imageWidth = options.imageWidth
        this.imageHeight = options.imageHeight
        this.canvasWidth = options.canvasWidth
        this.canvasHeight = options.canvasHeight
    }

    setScale = (scale: number) => {
        this.scale = scale
    }

    setCanvasWidth = (width: number) => {
        this.canvasWidth = width
    }

    setCanvasHeight = (height: number) => {
        this.canvasHeight = height
    }

    getParticleForce = (): ParticleForce => (particle: Particle) => {
        const pixelPosition = this.getPixelPosition()
        return forces.blackHole(pixelPosition.x, pixelPosition.y)(particle)
    }

    getPixelPosition = (): Vector => {
        const x = this.pixelX * this.scale + (this.canvasWidth / 2) - (this.imageWidth * this.scale / 2);
        const y = this.pixelY * this.scale + (this.canvasHeight / 2) - (this.imageHeight * this.scale / 2);
        return new Vector(x, y)
    }
}

export default PixelManager