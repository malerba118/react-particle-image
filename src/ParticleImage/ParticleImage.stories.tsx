import React from 'react';
// import { action } from '@storybook/addon-actions';
import ParticleImage from './ParticleImage';
import FPSStats from "react-fps-stats";

export default {
    title: 'ParticleImage'
};

export const Simple = () => {

    return (
        <>
            <FPSStats />
            <ParticleImage />
        </>
    );
};