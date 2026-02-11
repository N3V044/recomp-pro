import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PERIOD_LABELS } from '../domain/constants';

export default function MonthCarousel({ selectedPeriod, onSelect, periods }) {
    const containerRef = useRef(null);
    const scrollTimeout = useRef(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Mouse Drag Refs
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    const isDragGesture = useRef(false);

    // 1. Prepare Data: Replicate items for infinite loop
    const currentPeriods = periods || PERIOD_LABELS;
    const rawItems = useMemo(() => Object.entries(currentPeriods), [currentPeriods]);

    const SETS = 5;
    const CENTER_SET_INDEX = 2; // 0-based index of the middle set
    const items = useMemo(() => {
        let list = [];
        for (let i = 0; i < SETS; i++) {
            list = list.concat(rawItems.map(([key, label]) => ({ key, label, uniqueId: `${i}-${key}`, originalIndex: i })));
        }
        return list;
    }, [rawItems]);

    // 2. Initial Positioning
    useEffect(() => {
        if (containerRef.current) {
            const indexInSet = rawItems.findIndex(([k]) => k === selectedPeriod);
            if (indexInSet !== -1) {
                const totalIndex = (CENTER_SET_INDEX * rawItems.length) + indexInSet;
                scrollToIndex(totalIndex, 'auto');
            }
        }
    }, [selectedPeriod]); // Wait, if I depend on selectedPeriod, dragging might fight it.
    // Actually, we want to scroll to selectedPeriod ONLY if it wasn't triggered by internal scroll.
    // But since onSelect updates selectedPeriod, if we scroll to it, we just enforce the snap.
    // Let's rely on mount for initial. For updates, we can verify if we are already there.

    const scrollToIndex = (index, behavior = 'smooth') => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const itemElements = container.getElementsByClassName('carousel-item');
        if (itemElements[index]) {
            const item = itemElements[index];
            const containerCenter = container.clientWidth / 2;
            const itemCenter = item.offsetLeft + (item.clientWidth / 2);
            container.scrollTo({
                left: itemCenter - containerCenter,
                behavior: behavior
            });
        }
    };

    // 3. Handle Scroll
    const handleScroll = () => {
        if (!containerRef.current) return;
        // setIsScrolling(true); // Can cause render thrashing, but needed for snap

        const container = containerRef.current;
        const { scrollLeft, scrollWidth } = container;
        const totalWidth = scrollWidth;
        const singleSetWidth = totalWidth / SETS;

        // Infinite Reset
        if (scrollLeft < singleSetWidth * 0.5) {
            container.scrollLeft += singleSetWidth * (CENTER_SET_INDEX);
        }
        else if (scrollLeft > singleSetWidth * (SETS - 0.5)) {
            container.scrollLeft -= singleSetWidth * (CENTER_SET_INDEX);
        }

        // Selection Detection
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            // setIsScrolling(false);
            detectSelection();
        }, 150);
    };

    const detectSelection = () => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const centerPoint = container.scrollLeft + (container.clientWidth / 2);

        const itemElements = container.getElementsByClassName('carousel-item');
        let closestItem = null;
        let minDist = Infinity;

        Array.from(itemElements).forEach((el, index) => {
            const itemCenter = el.offsetLeft + (el.offsetWidth / 2);
            const dist = Math.abs(centerPoint - itemCenter);
            if (dist < minDist) {
                minDist = dist;
                closestItem = items[index];
            }
        });

        if (closestItem && closestItem.key !== selectedPeriod) {
            onSelect(closestItem.key);
        }
    };

    // 4. Mouse Drag Handlers
    const handleMouseDown = (e) => {
        isDragging.current = true;
        isDragGesture.current = false;
        startX.current = e.pageX - containerRef.current.offsetLeft;
        scrollLeftStart.current = containerRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX.current) * 1.5; // Drag speed
        if (Math.abs(walk) > 5) isDragGesture.current = true;
        containerRef.current.scrollLeft = scrollLeftStart.current - walk;
    };

    const handleClick = (item, index) => {
        if (isDragGesture.current) return; // Prevent click if dragged
        scrollToIndex(index, 'smooth');
        // Let scroll detect selection
    };

    return (
        <div className="carousel-wrapper">
            <div className="carousel-mask-left"></div>
            <div className="carousel-mask-right"></div>

            <div
                className="carousel-container"
                ref={containerRef}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {items.map((item, index) => {
                    const isSelected = item.key === selectedPeriod;
                    return (
                        <button
                            key={item.uniqueId}
                            className={`carousel-item ${isSelected ? 'active' : ''} ${item.key === 'ALL' ? 'all-time' : ''}`}
                            onClick={() => handleClick(item, index)}
                        >
                            {item.label}
                        </button>
                    )
                })}
            </div>
        </div>
    );
}
