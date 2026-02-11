import { useState, useEffect } from 'react';

export const useAnimatedCount = (end, duration = 1000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        // Use a simpler start value for smoother transition if re-triggered
        const start = count;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Ease out quart
            const easeProgress = 1 - Math.pow(1 - progress, 4);

            const currentCount = Math.floor(easeProgress * (end - start) + start);
            setCount(currentCount);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(end); // Ensure exact end value
            }
        };

        window.requestAnimationFrame(step);
    }, [end, duration]); // Re-run when target changes

    return count;
};
