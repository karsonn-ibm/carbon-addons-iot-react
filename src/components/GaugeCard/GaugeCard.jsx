import React, { useState, useEffect } from 'react';
/* eslint-disable */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { InlineLoading } from 'carbon-components-react';

import { CARD_CONTENT_PADDING } from '../../constants/LayoutConstants';
import { CardPropTypes, GaugeCardPropTypes } from '../../constants/PropTypes';
import Card from '../Card/Card';
import { settings } from '../../constants/Settings';

const { iotPrefix } = settings;
// r value of the circle in SVG
const radius = 30;
// radius doubled plus stroke
const gaugeSize = radius * 2 + 8;

const GaugeCard = ({
  id,
  title,
  tooltip,
  content: { gauges },
  values,
  data,
  isLoading,
  loadData,
  hasMoreData,
  size,
  className,
  ...others
}) => {
  const [loadedState, setLoadedState] = useState(false);
  const [gaugeColor, setGaugeColor] = useState();
  const [gaugeGrade, setGaugeGrade] = useState(null);
  useEffect(() => {
    setTimeout(() => {
      setLoadedState(true);
    }, 1000);
  }, []);
  const handleScroll = e => {
    const element = e.target;
    //  height of the elements content - height element’s content is scrolled vertically === height of the scrollable part of the element
    if (
      element.scrollHeight - element.scrollTop === element.clientHeight &&
      hasMoreData &&
      !isLoading
    ) {
      loadData();
    }
  };
  const getStrokeDash = value => {
    //circumference of SVG.
    const circum = 2 * Math.PI * radius;
    // length of stroke to match percentage
    return (value * circum) / 100;
  };

  const getColor = async (gauge, value) => {
    let color = gauge.color;
    let grade = '';
    const comparisons = {
      '<': (a, b) => a < b,
      '>': (a, b) => a > b,
      '=': (a, b) => (a = b),
      '<=': (a, b) => a <= b,
      '>=': (a, b) => a >= b,
    };
    if (gauge.thresholds) {
      await gauge.thresholds.map(thresh => {
        if (comparisons[thresh.comparison](value, thresh.value)) {
          color = thresh.color;
          grade = thresh.label;
        }
      });
    }
    setGaugeColor(color);
    setGaugeGrade(grade);
  };
  return (
    <Card
      id={id}
      className={`${iotPrefix}--gauge-card`}
      title={title}
      size={size}
      onScroll={handleScroll}
      {...others}
      tooltip={tooltip}
      isLoading={isLoading}
    >
      <div
        className={classnames(`${iotPrefix}--gauge-container`, className)}
        style={{
          paddingTop: 0,
          paddingRight: CARD_CONTENT_PADDING,
          paddingBottom: 0,
          paddingLeft: CARD_CONTENT_PADDING,
        }}
      >
        {gauges.map((gauge, i) => {
          getColor(gauge, values[gauge.dataSourceId]);
          return (
            <>
              <meter
                className={classnames({
                  [`${iotPrefix}--meter__centered`]: !gaugeGrade,
                })}
                key={`${gauge.dataSourceId}-${i}`}
                value={values[gauge.dataSourceId]}
                min={gauge.minimumValue}
                max={gauge.maximumValue}
                title={gauge.units}
              >
                <svg
                  className={classnames(
                    `${iotPrefix}--gauge`,
                    { [`${iotPrefix}--gauge__loaded`]: loadedState },
                    className
                  )}
                  percent="0"
                  style={{
                    '--gauge-value': values[gauge.dataSourceId] || 0,
                    '--gauge-max-value': gauge.maximumValue,
                    '--gauge-colors': gaugeColor,
                    '--gauge-bg': gauge.backgroundColor,
                    '--stroke-dash': getStrokeDash(values[gauge.dataSourceId]) || 0,
                    '--gauge-size': gaugeSize + 'px',
                    '--gauge-trend-color': gauge.trend.color,
                  }}
                >
                  <circle
                    className={`${iotPrefix}--gauge-bg`}
                    cx={gaugeSize / 2}
                    cy={gaugeSize / 2}
                    r={radius}
                  />
                  <circle
                    className={`${iotPrefix}--gauge-fg`}
                    cx={gaugeSize / 2}
                    cy={gaugeSize / 2}
                    r={radius}
                  />
                  <text
                    className={classnames(`${iotPrefix}--gauge-value`, {
                      [`${iotPrefix}--gauge-value__centered`]: !gaugeGrade,
                    })}
                    x={gaugeSize / 2}
                    y="29"
                    textAnchor="middle"
                  >
                    <tspan>{values[gauge.dataSourceId] + gauge.units}</tspan>
                  </text>
                  <text
                    className={`${iotPrefix}--gauge-rating`}
                    x={gaugeSize / 2}
                    y="50"
                    textAnchor="middle"
                  >
                    <tspan>{gaugeGrade}</tspan>
                  </text>
                </svg>
              </meter>
              <div
                className={classnames(`${iotPrefix}--gauge-trend`, {
                  [`${iotPrefix}--gauge-trend__up`]: gauge.trend.trend === 'up',
                  [`${iotPrefix}--gauge-trend__down`]: gauge.trend.trend === 'down',
                })}
                key={`${gauge.trend.dataSourceId}-${i}`}
              >
                <p>{values[gauge.trend.dataSourceId]}</p>
              </div>
            </>
          );
        })}
      </div>
    </Card>
  );
};

GaugeCard.propTypes = {
  ...CardPropTypes,
  ...GaugeCardPropTypes,
};

GaugeCard.defaultProps = {
  isLoading: false,
  description: null,
  content: {
    gauges: [
      {
        dataSourceId: null,
        units: '%',
        minimumValue: 0,
        maximumValue: 100,
        renderValueFunction: null,
        color: 'yellow',
        backgroundColor: 'gray',
        // @TODO: support half-circle and line gauge
        shape: 'circle',
        trend: null,
        thresholds: null,
      },
    ],
  },
  values: [],
};

GaugeCard.displayName = 'GaugeCard';

export default GaugeCard;
