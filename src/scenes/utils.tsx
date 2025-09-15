// BarGraph.tsx
import { Line, Node, Txt } from '@motion-canvas/2d';
import { createRef, createSignal, Reference, createEffect, SimpleSignal, useLogger } from '@motion-canvas/core';

export interface BarData {
  value: SimpleSignal<number>;
  barLabel?: SimpleSignal<string>;
  barValueLabel?: SimpleSignal<string>;
  color?: SimpleSignal<string>;
}

export interface BarGraphProps {
  bars: SimpleSignal<BarData[]>;
  height?: SimpleSignal<number>;
  magnitude?: SimpleSignal<number>;
  fontSize?: SimpleSignal<number>;
  barWidth?: SimpleSignal<number>;
  barSeparation?: SimpleSignal<number>;
  position?: SimpleSignal<[number, number]>;
  axisStroke?: SimpleSignal<string>;
  textFill?: SimpleSignal<string>;
  lineWidth?: SimpleSignal<number>;
  arrowSize?: SimpleSignal<number>;
  labelsDivision?: SimpleSignal<number>;
  showBarValueLabels?: SimpleSignal<boolean>;
  axisSuffix?: SimpleSignal<string>;
  magnitudeOffset?: SimpleSignal<number>;
}

// Helper function to format numbers
function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return value.toFixed(1);
}

export function createBarGraph(props: BarGraphProps) {
  const {
    bars,
    height = createSignal(600),
    fontSize = createSignal(30),
    barWidth = createSignal(100),
    barSeparation = createSignal(50),
    position = createSignal([0, 0]),
    axisStroke = createSignal('white'),
    textFill = createSignal('white'),
    lineWidth = createSignal(10),
    arrowSize = createSignal(15),
    labelsDivision = createSignal(10),
    showBarValueLabels = createSignal(true),
    axisSuffix = createSignal(''),
    magnitudeOffset = createSignal(0)
  } = props;

  const barsNumber = () => bars().length;
  const graphWidth = () => (barsNumber() * barWidth() + (barsNumber() + 1) * barSeparation());

  const graphRef = createRef<Node>();
  const axisLinesRef = createRef<Line>();
  const labelsRef = [] as Reference<Txt>[];
  const barsRef = [] as Reference<Line>[];

  const graphNode = (
    <Node ref={graphRef}>
      <Line
        ref={axisLinesRef}
        startArrow
        endArrow
        stroke={() => axisStroke()}
        lineWidth={() => lineWidth()}
        lineJoin={'miter'}
        arrowSize={() => arrowSize()}
        points={[]}
      />
    </Node>
  );

  let previousBarsLength = 0;
  let previousMagnitude = 0;
  
  createEffect(() => {
    const currentBarsLength = bars().length;
    const currentGraphWidth = graphWidth();
    const magnitude = () => Math.max(...bars().map(bar => bar.value()), 10) + magnitudeOffset();

    // log.debug(magnitude().toString());
    
    // Always update graph position and axis
    graphRef().position([
      position()[0] - currentGraphWidth / 4, 
      position()[1] + height() / 4
    ]);
    
    axisLinesRef().points([
      [graphRef().x(), graphRef().y() - height()],
      [graphRef().x(), graphRef().y()],
      [graphRef().x() + currentGraphWidth, graphRef().y()],
    ]);

    // Smart label updates
    if (magnitude() !== previousMagnitude) {
      const labelDistance = height() / (magnitude() / labelsDivision());
      const neededLabelCount = Math.floor(height() / labelDistance) + 1;
      
      // Remove excess labels if we have too many
      if (neededLabelCount < labelsRef.length) {
        for (let i = neededLabelCount; i < labelsRef.length; i++) {
          if (labelsRef[i]().parent()) {
            labelsRef[i]().remove();
          }
        }
        labelsRef.length = neededLabelCount;
      }
      
      // Reuse existing labels, create new ones if needed
      for (let i = 0; i < neededLabelCount; i++) {
        const labelValue = i * labelsDivision();
        const labelText = `${formatNumber(labelValue)}${axisSuffix()}`;
        if (i < labelsRef.length) {
          // Reuse existing label
          labelsRef[i]().text(labelText);
          labelsRef[i]().x(- (2 * fontSize()) + graphRef().x());
          labelsRef[i]().y(graphRef().y() - i * labelDistance);
        } else {
          // Create new label
          const labelRef = createRef<Txt>();
          labelsRef.push(labelRef);
          
          graphRef().add(
            <Txt
              ref={labelRef}
              text={labelText}
              fontSize={() => fontSize()}
              fontFamily={'Pixel Code'}
              fill={() => textFill()}
              x={() => (- (2 * fontSize()) + graphRef().x())}
              y={() => (graphRef().y() - i * labelDistance)}
            />
          );
        }
      }
      
      previousMagnitude = magnitude();
    }

    // Smart bar updates - reuse existing bars
    for (let i = 0; i < Math.max(currentBarsLength, previousBarsLength); i++) {
      if (i < currentBarsLength) {
        const barData = bars()[i];
        const barX = () => graphRef().x() + barSeparation() + (i * (barWidth() + barSeparation())) + barWidth() / 2;
        const barColor = () => barData.color ? barData.color() : axisStroke();
        
        if (i < barsRef.length) {
          // Reuse existing bar
          const bar = barsRef[i]();
          bar.opacity(1);
          bar.points([
            [barX(), graphRef().y()],
            [barX(), graphRef().y() - barData.value() * height() / magnitude()],
          ]);
          bar.stroke(barColor());
          
          // Update labels if they exist
          const children = bar.children();
          children.forEach(child => {
            if (child instanceof Txt) {
              const txt = child as Txt;
              const currentText = txt.text();
              const suffix = barData.barValueLabel?.() || '';
              
              // Check if this is a value label (contains the suffix or looks like a number)
              if (showBarValueLabels() && suffix && (currentText.includes(suffix) || /^\d/.test(currentText))) {
                const formattedValue = formatNumber(barData.value());
                txt.text(`${formattedValue}${suffix}`);
                txt.position([barX(), graphRef().y() - barData.value() * height() / magnitude() - fontSize()]);
                txt.opacity(1);
              } else if (!showBarValueLabels() && suffix && (currentText.includes(suffix) || /^\d/.test(currentText))) {
                txt.opacity(0);
              } else if (currentText === (barData.barLabel?.() || '')) {
                txt.text(barData.barLabel?.() || '');
                txt.position([barX(), graphRef().y() + (2 * fontSize())]);
              }
            }
          });
        } else {
          // Create new bar
          const barRef = createRef<Line>();
          barsRef.push(barRef);
          
          graphRef().add(
            <Line
              ref={barRef}
              points={() => [
                [barX(), graphRef().y()],
                [barX(), graphRef().y() - barData.value() * height() / magnitude()],
              ]}
              lineWidth={() => barWidth()}
              stroke={() => barColor()}
              zIndex={-1}
            >
              {showBarValueLabels() && barData.barValueLabel && (
                <Txt
                  text={() => `${formatNumber(barData.value())}${barData.barValueLabel()}`}
                  x={() => barX()}
                  y={() => graphRef().y() - barData.value() * height() / magnitude() - fontSize()}
                  fontSize={() => fontSize()}
                  fontFamily={'Pixel Code'}
                  fill={() => textFill()}
                />
              )}
              {barData.barLabel && (
                <Txt
                  text={() => barData.barLabel()}
                  x={() => barX()}
                  y={() => graphRef().y() + (2 * fontSize())}
                  fontSize={() => fontSize()}
                  fontFamily={'Pixel Code'}
                  fill={() => textFill()}
                />
              )}
            </Line>
          );
        }
      } else if (i < barsRef.length) {
        // Hide excess bars
        barsRef[i]().remove();
      }
    }
    
    previousBarsLength = currentBarsLength;
  });

  return {
    node: graphNode,
    ref: graphRef,
    height,
    fontSize,
    barWidth,
    barSeparation,
    position,
    axisStroke,
    textFill,
    lineWidth,
    arrowSize,
    labelsDivision,
    showBarValueLabels,
    axisSuffix,
    bars
  };
}