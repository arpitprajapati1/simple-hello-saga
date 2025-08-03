import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { BubbleData } from '../services/cryptoApi';
import { CoinTooltip } from './CoinTooltip';

interface BubbleChartProps {
  data: BubbleData[];
  width?: number;
  height?: number;
  onBubbleClick?: (bubble: BubbleData) => void;
  className?: string;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  width = 1200,
  height = 800,
  onBubbleClick,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleData, undefined> | null>(null);
  const [tooltip, setTooltip] = useState<{
    data: BubbleData;
    x: number;
    y: number;
    visible: boolean;
  }>({
    data: {} as BubbleData,
    x: 0,
    y: 0,
    visible: false,
  });

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const showTooltip = useCallback((event: MouseEvent, data: BubbleData) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        data,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true,
      });
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group
    const container = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g');

    // Create space background gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'space-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')
      .attr('gradientTransform', 'rotate(45)');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(0, 0%, 0%)')
      .attr('stop-opacity', 1);
    
    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', 'hsl(240, 100%, 50%)')
      .attr('stop-opacity', 1);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(0, 0%, 0%)')
      .attr('stop-opacity', 1);

    // Add space background
    container.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#space-gradient)');

    // Add stars
    const starData = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.8 + 0.2
    }));

    container.selectAll('.star')
      .data(starData)
      .join('circle')
      .attr('class', 'star')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.size)
      .attr('fill', 'white')
      .attr('opacity', d => d.opacity);

    // Define octagonal bubble motion area
    const centerX = width / 2;
    const centerY = height / 2;
    const octagonRadius = Math.min(width, height) * 0.48;
    
    // Create octagon vertices
    const octagonVertices = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      octagonVertices.push({
        x: centerX + octagonRadius * Math.cos(angle),
        y: centerY + octagonRadius * Math.sin(angle)
      });
    }

    // Function to check if point is inside octagon
    const isInsideOctagon = (x: number, y: number, radius: number) => {
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      return distance + radius < octagonRadius;
    };

    // Limit to 30 bubbles and normalize bubble sizes for better readability
    const normalizedData = data.slice(0, 30).map(d => ({
      ...d,
      radius: Math.min(Math.max(d.radius * 0.7, 25), 60) // Min 25px, max 60px
    }));

    // Create force simulation with octagonal constraint and continuous motion
    const simulation = d3.forceSimulation(normalizedData)
      .force('center', d3.forceCenter(centerX, centerY))
      .force('collision', d3.forceCollide<BubbleData>().radius(d => d.radius + 3))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('x', d3.forceX(centerX).strength(0.02))
      .force('y', d3.forceY(centerY).strength(0.02))
      .force('octagon', () => {
        normalizedData.forEach(d => {
          if (!isInsideOctagon(d.x!, d.y!, d.radius)) {
            const angle = Math.atan2(d.y! - centerY, d.x! - centerX);
            const distance = octagonRadius - d.radius - 5;
            d.x = centerX + distance * Math.cos(angle);
            d.y = centerY + distance * Math.sin(angle);
          }
        });
      })
      .alphaDecay(0.01) // Slower decay for continuous motion
      .alphaMin(0.1); // Keep some motion always active

    simulationRef.current = simulation;

    // Create bubble groups using normalized data
    const bubbles = container
      .selectAll('.bubble-group')
      .data(normalizedData)
      .join('g')
      .attr('class', 'bubble-group')
      .style('cursor', 'pointer');

    // Add continuous gentle motion
    setInterval(() => {
      if (simulation.alpha() < 0.2) {
        simulation.alpha(0.15).restart();
      }
    }, 3000);

    // Add transparent bubble circles with colored borders
    bubbles.append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Add coin symbol text (top line)
    bubbles
      .append('text')
      .attr('class', 'bubble-symbol')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.2em')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('font-size', 12)
      .attr('fill', 'white')
      .attr('fill-opacity', 0.9)
      .style('pointer-events', 'none')
      .text(d => d.symbol);

    // Add percentage change text (bottom line)
    bubbles
      .append('text')
      .attr('class', 'bubble-percentage')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.8em')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('font-size', 10)
      .attr('fill', d => d.priceChange24h >= 0 ? 'hsl(142, 76%, 45%)' : 'hsl(0, 84%, 60%)')
      .attr('fill-opacity', 0.9)
      .style('pointer-events', 'none')
      .text(d => `${d.priceChange24h >= 0 ? '+' : ''}${d.priceChange24h.toFixed(1)}%`);

    // Add interactivity with smooth hover effects
    bubbles
      .on('mouseenter', function(event, d) {
        const bubble = d3.select(this).select('.bubble');
        bubble
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('r', d.radius * 1.1)
          .attr('stroke-width', 3);
        
        showTooltip(event, d);
      })
      .on('mouseleave', function(event, d) {
        const bubble = d3.select(this).select('.bubble');
        bubble
          .transition()
          .duration(150)
          .attr('opacity', 0.8)
          .attr('r', d.radius)
          .attr('stroke-width', 2);
        
        hideTooltip();
      })
      .on('mousemove', function(event, d) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          
          // Gentle attraction to mouse position
          const dx = mouseX - d.x!;
          const dy = mouseY - d.y!;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 20) {
            d.fx = d.x! + dx * 0.05;
            d.fy = d.y! + dy * 0.05;
          }
        }
        showTooltip(event, d);
      })
      .on('click', function(event, d) {
        if (onBubbleClick) {
          onBubbleClick(d);
        }
      });

    // Drag behavior
    const dragBehavior = d3.drag<SVGGElement, BubbleData>()
      .on('start', function(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        hideTooltip();
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    bubbles.call(dragBehavior);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      bubbles.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, onBubbleClick, showTooltip, hideTooltip]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (simulationRef.current) {
        const newWidth = Math.min(window.innerWidth - 40, 1200);
        const newHeight = Math.min(window.innerHeight - 200, 800);
        
        simulationRef.current
          .force('center', d3.forceCenter(newWidth / 2, newHeight / 2))
          .force('x', d3.forceX(newWidth / 2).strength(0.05))
          .force('y', d3.forceY(newHeight / 2).strength(0.05))
          .alpha(0.3)
          .restart();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
      {tooltip.visible && (
        <CoinTooltip
          data={tooltip.data}
          x={tooltip.x}
          y={tooltip.y}
          onClose={hideTooltip}
        />
      )}
    </div>
  );
};