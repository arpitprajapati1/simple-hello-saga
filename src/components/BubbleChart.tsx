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

    // Create background gradient
    const defs = svg.append('defs');
    const gradient = defs.append('radialGradient')
      .attr('id', 'background-gradient')
      .attr('cx', '50%')
      .attr('cy', '50%')
      .attr('r', '70%');
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'hsl(225, 20%, 15%)')
      .attr('stop-opacity', 0.1);
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'hsl(225, 25%, 8%)')
      .attr('stop-opacity', 0.8);

    // Add background
    container.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#background-gradient)');

    // Create lightweight force simulation
    const simulation = d3.forceSimulation(data)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleData>().radius(d => d.radius + 1))
      .force('charge', d3.forceManyBody().strength(-20))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.05);

    simulationRef.current = simulation;

    // Create bubble groups
    const bubbles = container
      .selectAll('.bubble-group')
      .data(data)
      .join('g')
      .attr('class', 'bubble-group')
      .style('cursor', 'pointer');

    // Add transparent bubble circles with colored borders
    bubbles.append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Add text labels
    bubbles
      .append('text')
      .attr('class', 'bubble-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('font-size', d => Math.min(d.radius / 2, 18))
      .attr('fill', 'white')
      .attr('fill-opacity', 0.9)
      .style('pointer-events', 'none')
      .text(d => d.symbol);

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