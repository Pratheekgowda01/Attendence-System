import React, { useState } from 'react';
import './PieChart.css';

const PieChart = ({ data, colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    color: colors[index % colors.length]
  }));

  // Calculate pie chart segments
  const radius = 100;
  const centerX = 130;
  const centerY = 130;
  let currentAngle = -90; // Start from top

  const segments = chartData.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate path for pie slice
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      index
    };
  });

  const handleSliceHover = (segment, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIndex(segment.index);
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      data: segment
    });
  };

  const handleSliceLeave = () => {
    setHoveredIndex(null);
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  // Calculate label positions
  const labelRadius = radius + 30;
  const labels = segments.map(segment => {
    const midAngleRad = (segment.midAngle * Math.PI) / 180;
    const x = centerX + labelRadius * Math.cos(midAngleRad);
    const y = centerY + labelRadius * Math.sin(midAngleRad);
    return {
      ...segment,
      labelX: x,
      labelY: y,
      labelAnchor: x > centerX ? 'start' : 'end'
    };
  });

  return (
    <div className="pie-chart-container">
      <div className="pie-chart-wrapper">
        <svg width="260" height="260" viewBox="0 0 260 260" className="pie-chart-svg">
          {/* Pie slices */}
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="white"
                strokeWidth="3"
                className={`pie-slice ${hoveredIndex === index ? 'hovered' : ''}`}
                onMouseEnter={(e) => handleSliceHover(segment, e)}
                onMouseLeave={handleSliceLeave}
                style={{
                  opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1,
                  transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transition: 'all 0.3s ease'
                }}
              />
              {/* Percentage labels on slices */}
              {segment.percentage > 5 && (
                <text
                  x={centerX + (radius * 0.7) * Math.cos((segment.midAngle * Math.PI) / 180)}
                  y={centerY + (radius * 0.7) * Math.sin((segment.midAngle * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-percentage-label"
                  fill="white"
                  fontSize="14"
                  fontWeight="700"
                >
                  {segment.percentage.toFixed(1)}%
                </text>
              )}
            </g>
          ))}
          
          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.6}
            fill="white"
            className="pie-center"
          />
          
          {/* Center text */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pie-center-title"
            fill="#1f2937"
            fontSize="14"
            fontWeight="700"
          >
            Total Present
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pie-center-value"
            fill="#667eea"
            fontSize="28"
            fontWeight="800"
          >
            {total}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="pie-chart-legend">
        {chartData.map((item, index) => (
          <div
            key={index}
            className={`legend-item ${hoveredIndex === index ? 'highlighted' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="legend-content">
              <div className="legend-name">{item.label}</div>
              <div className="legend-stats">
                <span className="stat-present">Present: {item.present || 0}</span>
                <span className="stat-late">Late: {item.late || 0}</span>
                <span className="stat-absent">Absent: {item.absent || 0}</span>
              </div>
            </div>
            <div className="legend-percentage">{item.percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="pie-chart-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`
          }}
        >
          <div className="tooltip-header">{tooltip.data.label}</div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label">Percentage:</span>
              <span className="tooltip-value">{tooltip.data.percentage.toFixed(1)}%</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">Present:</span>
              <span className="tooltip-value">{tooltip.data.present || 0}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">Late:</span>
              <span className="tooltip-value">{tooltip.data.late || 0}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">Absent:</span>
              <span className="tooltip-value">{tooltip.data.absent || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieChart;

