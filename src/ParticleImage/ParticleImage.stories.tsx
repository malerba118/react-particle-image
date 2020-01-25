import React from 'react';
// import { action } from '@storybook/addon-actions';
import ParticleImage from './ParticleImage';
import FPSStats from "react-fps-stats";

export default {
    title: 'ParticleImage'
};

const particleOptions = {
    radius: () => 1,
    mass: () => 50,
    filter: ({x, y, image}) => {
        const pixel = image.get(x, y)
        return pixel.b > 50
    },
    color: () => '#61D9FB',
    friction: () => 5
}

export const Simple = () => {

    return (
        <>
            <FPSStats />
            <ParticleImage src={'/react-logo.png'} height={800} width={800} particleOptions={particleOptions} scale={.8} />
        </>
    );
};