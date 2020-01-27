import React from 'react';
// import { action } from '@storybook/addon-actions';
import ParticleImage from './ParticleImage';
import FPSStats from "react-fps-stats";
import { withKnobs, number } from "@storybook/addon-knobs";
import { Vector, forces } from '../universe';

export default {
    title: 'ParticleImage',
    decorators: [withKnobs]
}; 

const particleOptions = {
    radius: () => 1,
    mass: () => 50,
    filter: ({x, y, image}) => {
        const pixel = image.get(x, y)
        return pixel.b > 50
    },
    color: () => '#61D9FB',
    friction: () => .15
}

export const Simple = () => {

    const width = number('Width', 800)
    const height = number('Height', 800)
    const scale = number('Scale', .8)

    return (
        <>
            <FPSStats />
            <ParticleImage src={'/react-logo.png'} maxParticles={5000} height={height} width={width} particleOptions={particleOptions} scale={scale} interactiveForce={(x: number, y: number) => forces.whiteHole(x, y, 3)}/>
        </>
    );
};