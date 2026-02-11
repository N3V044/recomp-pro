import React from 'react';
import { useAnimatedCount } from '../hooks/useAnimatedCount';

export const AnimatedNumber = ({ value, duration }) => {
    const count = useAnimatedCount(value, duration);
    return <>{count}</>;
};
