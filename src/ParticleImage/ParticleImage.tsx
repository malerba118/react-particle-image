import React, { FC, useEffect, useRef, useCallback, useState, CSSProperties, HTMLProps } from 'react';
import { Universe, Particle, CanvasRenderer, Simulator, ParticleForce, Vector, forces, PixelManager, Array2D } from '../universe'
import { getImageData, range, shuffle, getMousePosition, RGBA } from '../utils'
import createImageUniverse, { ImageUniverseSetupResult } from './createImageUniverse'
import throttle from 'lodash.throttle'

export type PixelOptions = {
    x: number;
    y: number;
    image: Array2D<RGBA>
}

export interface ParticleOptions {
    filter?: (options: PixelOptions) => boolean;
    radius?: (options: PixelOptions) => number;
    mass?: (options: PixelOptions) => number;
    color?: (options: PixelOptions) => string;
    friction?: (options: PixelOptions) => number;
    initialPosition?: (options: PixelOptions & {finalPosition: Vector}) => Vector;
    initialVelocity?: (options: PixelOptions) => Vector;
}

export interface ParticleImageProps extends HTMLProps<HTMLCanvasElement> {
    src: string
    height?: number;
    style?: CSSProperties;
    width?: number;
    scale?: number;
    maxParticles?: number;
    entropy?: number;
    backgroundColor?: string;
    particleOptions?: ParticleOptions;
    interactiveForce?: (x: number, y: number) => ParticleForce;
}

type DefaultParticleOptions = Required<ParticleOptions>

const defaultParticleOptions: DefaultParticleOptions = {
    filter: () => true,
    radius: () => 1,
    mass: () => 25,
    color: () => 'white',
    friction: () => 10,
    initialPosition: ({finalPosition}) => finalPosition,
    initialVelocity: () => new Vector(0, 0)
}

const defaultInteractiveForce =  (x: number, y: number) => forces.whiteHole(x, y)

const ParticleImage: FC<ParticleImageProps> = ({src, height = 400, width = 400, scale = 1, maxParticles = 5000, entropy = 10, backgroundColor = '#222', particleOptions = defaultParticleOptions, interactiveForce = defaultInteractiveForce, style={}, ...otherProps}) => {

    const [canvas, setCanvas] = useState<HTMLCanvasElement>()
    const [universe, setUniverse] = useState<Universe>()
    const simulatorRef = useRef<Simulator>()
    const mouseParticleForce = useRef<ParticleForce>()
    const entropyForceRef = useRef<ParticleForce>()
    const [pixelManagers, setPixelManagers] = useState<PixelManager[]>([])
    const interactionTimeoutId = useRef<number>()

    const mergedParticleOptions: Required<ParticleOptions> = {
        ...defaultParticleOptions,
        ...particleOptions
    }

    useEffect(() => {
        if (canvas) {
            const renderer = new CanvasRenderer(canvas)
            const simulator = new Simulator(renderer)
            simulatorRef.current = simulator
            simulator.start()
            return () => simulator.stop()
        }
    }, [canvas])

    useEffect(() => {
        if (canvas) {
            const death = universe?.die()
            const setUp = createImageUniverse({url: src, maxParticles, particleOptions: mergedParticleOptions, scale, canvasWidth: width, canvasHeight: height})
            Promise.all<ImageUniverseSetupResult, void>([setUp, death])
                .then(([{universe, pixelManagers}]) => {
                    setPixelManagers(pixelManagers)
                    universe.addParticleForce(forces.friction)
                    simulatorRef.current?.setUniverse(universe)
                    setUniverse(universe)
                })
        }
    }, [canvas, src])

    const updateScale = useCallback(throttle((scale: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setScale(scale)
        })
    }, 50), [pixelManagers])

    const updateWidth = useCallback(throttle((width: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setCanvasWidth(width)
        })
    }, 50), [pixelManagers])

    const updateHeight = useCallback(throttle((height: number) => {
        pixelManagers.forEach((pixelManager) => {
            pixelManager.setCanvasHeight(height)
        })
    }, 50), [pixelManagers])

    useEffect(() => {
        updateScale(scale)
    }, [scale, pixelManagers])

    useEffect(() => {
        updateWidth(width)
    }, [width, pixelManagers])

    useEffect(() => {
        updateHeight(height)
    }, [height, pixelManagers])

    useEffect(() => {
        const entropyForce = forces.entropy(entropy)
        universe?.addParticleForce(entropyForce)
        entropyForceRef.current = entropyForce
        return () => {
            universe?.removeParticleForce(entropyForce)
        }
    }, [entropy, canvas, universe])

    const handleMouseMove = useCallback((e) => {
        const position = getMousePosition(e)
        if (universe) {
            if (mouseParticleForce.current) {
                window.clearTimeout(interactionTimeoutId.current)
                universe.removeParticleForce(mouseParticleForce.current)
            }
            const nextForce = interactiveForce(position.x, position.y)
            mouseParticleForce.current = nextForce
            universe.addParticleForce(mouseParticleForce.current)
            interactionTimeoutId.current = window.setTimeout(() => {
                universe.removeParticleForce(nextForce)
            }, 100)
        }
    }, [universe])

    return (
        <canvas
            {...otherProps}
            onMouseMove={handleMouseMove} 
            height={height} 
            width={width} 
            style={{backgroundColor, ...style}} 
            ref={(c) =>  {
                if (c?.getContext('2d')) {
                    setCanvas(c)
                }
            }}
        />
    )
}

export default ParticleImage