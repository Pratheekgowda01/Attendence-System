import React, { useState } from 'react';
import './AdvancedChart.css';

const AdvancedChart = ({ data, totalEmployees, title = "Weekly Attendance Trend" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

  const maxValue = Math.max(...data.map(d => d.present + d.absent), totalEmployees || 5);
  const chartHeight = 280;
  const chartPadding = { top: 40, bottom: 60, left: 50, right: 50 };

  const handleBarHover = (index, day, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredIndex(index);
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      data: day
    });
  };

  const handleBarLeave = () => {
    setHoveredIndex(null);
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  };

  // Calculate Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = [];
  for (let i = 0; i <= yAxisSteps; i++) {
    yAxisLabels.push(Math.round((maxValue / yAxisSteps) * i));
  }

  return (
    <div className="advanced-chart-container">
      <div className="chart-wrapper">
        {/* Y-Axis */}
        <div className="y-axis">
          {yAxisLabels.reverse().map((label, index) => (
            <div key={index} className="y-axis-label">
              <span className="y-axis-text">{label}</span>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="chart-area">
          {/* Grid Lines */}
          <div className="chart-grid">
            {yAxisLabels.map((_, index) => (
              <div
                key={index}
                className="grid-line"
                style={{
                  bottom: `${(index / (yAxisSteps)) * 100}%`
                }}
              />
            ))}
          </div>

          {/* Bars */}
          <div className="bars-container">
            {data.map((day, index) => {
              const presentHeight = (day.present / maxValue) * (chartHeight - chartPadding.top - chartPadding.bottom);
              const absentHeight = (day.absent / maxValue) * (chartHeight - chartPadding.top - chartPadding.bottom);
              const totalHeight = presentHeight + absentHeight;
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={index}
                  className="bar-group"
                  onMouseEnter={(e) => handleBarHover(index, day, e)}
                  onMouseLeave={handleBarLeave}
                >
                  {/* Bar Container */}
                  <div
                    className="bar-wrapper"
                    style={{
                      height: `${chartHeight - chartPadding.top - chartPadding.bottom}px`
                    }}
                  >
                    {/* Present Bar */}
                    {presentHeight > 0 && (
                      <div
                        className={`bar bar-present ${isHovered ? 'bar-hovered' : ''}`}
                        style={{
                          height: `${presentHeight}px`,
                          animationDelay: `${index * 0.1}s`
                        }}
                        title={`Present: ${day.present}`}
                      >
                        {isHovered && (
                          <div className="bar-value">{day.present}</div>
                        )}
                      </div>
                    )}

                    {/* Absent Bar */}
                    {absentHeight > 0 && (
                      <div
                        className={`bar bar-absent ${isHovered ? 'bar-hovered' : ''}`}
                        style={{
                          height: `${absentHeight}px`,
                          animationDelay: `${index * 0.1 + 0.05}s`
                        }}
                        title={`Absent: ${day.absent}`}
                      >
                        {isHovered && (
                          <div className="bar-value">{day.absent}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* X-Axis Label */}
                  <div className="x-axis-label">
                    <span className="x-axis-text">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    {isHovered && (
                      <div className="x-axis-detail">
                        <div>Present: {day.present}</div>
                        <div>Absent: {day.absent}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-indicator legend-present"></div>
          <span className="legend-text">Present</span>
        </div>
        <div className="legend-item">
          <div className="legend-indicator legend-absent"></div>
          <span className="legend-text">Absent</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.data && (
        <div
          className="chart-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`
          }}
        >
          <div className="tooltip-header">
            {new Date(tooltip.data.date).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="tooltip-content">
            <div className="tooltip-item">
              <span className="tooltip-label">Present:</span>
              <span className="tooltip-value">{tooltip.data.present}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">Absent:</span>
              <span className="tooltip-value">{tooltip.data.absent}</span>
            </div>
            <div className="tooltip-item">
              <span className="tooltip-label">Total:</span>
              <span className="tooltip-value">{tooltip.data.present + tooltip.data.absent}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedChart;

