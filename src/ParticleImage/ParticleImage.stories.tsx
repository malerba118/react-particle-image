import React, { useState } from 'react';
import ParticleImage from './ParticleImage';
import FPSStats from "react-fps-stats";
import { withKnobs, number, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";

import { forces } from '../universe';
import { ImageState } from '../types';

export default {
    title: 'ParticleImage',
    decorators: [withKnobs]
}; 

const widthOptions = {
    range: true,
    min: 400,
    max: 1000,
    step: 1,
 };

 const heightOptions = {
    range: true,
    min: 400,
    max: 1000,
    step: 1,
 };

 const scaleOptions = {
    range: true,
    min: 0,
    max: 3,
    step: .1,
 };

 const entropyOptions = {
    range: true,
    min: 0,
    max: 100,
    step: 1,
 };

const REACT_LOGO_URL = '/react-logo.png'
const PORTRAIT_URL = '/sample.png'

const particleOptionsMap = {
    [REACT_LOGO_URL]: {
        radius: () => 1,
        mass: () => 50,
        filter: ({x, y, image}) => {
            const pixel = image.get(x, y)
            return pixel.b > 50
        },
        color: () => '#61D9FB',
        friction: () => .15
    },
    [PORTRAIT_URL]: {
        radius: ({x, y, image}) => {
            const pixel = image.get(x, y)
            let magnitude = (pixel.r + pixel.g + pixel.b) / 3 / 255 * pixel.a/255
            return magnitude * 3
        },
        mass: () => 40,
        filter: ({x, y, image}) => {
            const pixel = image.get(x, y)
            let magnitude = (pixel.r + pixel.g + pixel.b) / 3 / 255 * pixel.a/255
            return magnitude > .22
        },
        color: ({x, y, image}) => 'white',
        friction: () => .15
    }
}

export const Playground = () => {

    const width = number('Width', 800, widthOptions)
    const height = number('Height', 400, heightOptions)
    const scale = number('Scale', 1, scaleOptions)
    const entropy = number('Entropy', 10, entropyOptions)
    const src = select('Source', [REACT_LOGO_URL, PORTRAIT_URL], REACT_LOGO_URL)

    return (
        <>
            <FPSStats />
            <ParticleImage src={src} maxParticles={6000} height={height} width={width} particleOptions={particleOptionsMap[src]} scale={scale} entropy={entropy} mouseMoveForce={(x: number, y: number) => forces.disturbance(x, y, 6)} onImageStateChange={console.log} onUniverseStateChange={console.log}/>
        </>
    );
};

export const Defaults = () => {
    return (
        <ParticleImage src={REACT_LOGO_URL} />
    );
};

export const DefaultsWithFilter = () => {
    const particleOptions = {
        filter: ({x, y, image}) => {
            const pixel = image.get(x, y)
            return pixel.b > 50
        },
    }

    return (
        <ParticleImage src={REACT_LOGO_URL} particleOptions={particleOptions} />
    );
};

export const DefaultsWithFilterAndInteraction = () => {
    const particleOptions = {
        filter: ({x, y, image}) => {
            const pixel = image.get(x, y)
            return pixel.b > 50
        },
    }

    return (
        <ParticleImage 
            src={REACT_LOGO_URL} 
            particleOptions={particleOptions} 
            mouseMoveForce={(x: number, y: number) => forces.disturbance(x, y, 4)} 
        />
    );
};


export const MouseDownForceDuration = () => {
    const particleOptions = {
        filter: ({x, y, image}) => {
            const pixel = image.get(x, y)
            return pixel.b > 50
        },
    }

    return (
        <ParticleImage 
            src={REACT_LOGO_URL} 
            particleOptions={particleOptions} 
            mouseDownForce={(x: number, y: number) => forces.disturbance(x, y, 50)} 
            mouseDownForceDuration={2000}
        />
    );
};

export const InvalidUrl = () => {
    const [error, setError] = useState(false)

    if (error) {
        return <div>Error</div>
    }

    return (
        <ParticleImage 
            src={'/foo'} 
            onImageStateChange={(state) => {
                if (state === ImageState.Error) {
                    setError(true)
                }
            }}
        />
    );
};


