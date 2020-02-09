import React, { FC, useEffect, useRef, useCallback, useState, CSSProperties, HTMLProps } from 'react';
import { Universe, CanvasRenderer, Simulator, ParticleForce, Vector, forces, PixelManager, Array2D } from '../universe'
import { getMousePosition, getTouchPosition, RGBA } from '../utils'
import createImageUniverse, { ImageUniverseSetupResult } from './createImageUniverse'
import throttle from 'lodash.throttle'
import useTransientParticleForce from './useTransientParticleForce';
import { Dimensions } from '../types'

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
    initialPosition?: (options: PixelOptions & {finalPosition: Vector, canvasDimensions: Dimensions}) => Vector;
    initialVelocity?: (options: PixelOptions) => Vector;
}

/**
 * Available props for ParticleImage.
 * @noInheritDoc
 */
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
    mouseMoveForce?: (x: number, y: number) => ParticleForce;
    touchMoveForce?: (x: number, y: number) => ParticleForce;
    mouseDownForce?: (x: number, y: number) => ParticleForce;
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

const defaultInteractiveForce =  (x: number, y: number) => forces.disturbance(x, y)

const ParticleImage: FC<ParticleImageProps> = ({src, height = 400, width = 400, scale = 1, maxParticles = 5000, entropy = 10, backgroundColor = '#222', particleOptions = defaultParticleOptions, mouseMoveForce, touchMoveForce, mouseDownForce, style={}, ...otherProps}) => {

    const [canvas, setCanvas] = useState<HTMLCanvasElement>()
    const [universe, setUniverse] = useState<Universe>()
    const simulatorRef = useRef<Simulator>()
    const entropyForceRef = useRef<ParticleForce>()
    const [pixelManagers, setPixelManagers] = useState<PixelManager[]>([])

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
            const canvasDimensions = {
                width: canvas.width,
                height: canvas.height
            }
            const death = universe?.die()
            const setUp = createImageUniverse({url: src, maxParticles, particleOptions: mergedParticleOptions, scale, canvasDimensions})
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

    const [mouseMoveParticleForce, setMouseMoveParticleForce] = useTransientParticleForce({universe})
    const [touchMoveParticleForce, setTouchMoveParticleForce] = useTransientParticleForce({universe})
    const [mouseDownParticleForce, setMouseDownParticleForce] = useTransientParticleForce({universe})

    const handleMouseMove = (e) => {
        const position = getMousePosition(e)
        if (mouseMoveForce) {
            setMouseMoveParticleForce(() => mouseMoveForce(position.x, position.y))
        }
    }

    const handleTouchMove = (e) => {
        const position = getTouchPosition(e)
        if (touchMoveForce) {
            setTouchMoveParticleForce(() => touchMoveForce(position.x, position.y))
        }
    }

    const handleMouseDown = (e) => {
        const position = getMousePosition(e)
        if (mouseDownForce) {
            setMouseDownParticleForce(() => mouseDownForce(position.x, position.y))
        }
    }

    return (
        <canvas
            {...otherProps}
            onMouseMove={handleMouseMove} 
            onTouchMove={handleTouchMove} 
            onMouseDown={handleMouseDown}
            height={height} 
            width={width} 
            style={{backgroundColor, touchAction: 'none', ...style}} 
            ref={(c) =>  {
                if (c?.getContext('2d')) {
                    setCanvas(c)
                }
            }}
        />
    )
}

export default ParticleImage