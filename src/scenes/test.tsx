import { Circle, Img, Line, makeScene2D, Node, Txt } from '@motion-canvas/2d';
import { all, beginSlide, createRef, createSignal, easeInOutCubic, easeInSine, easeOutCubic, easeOutSine, Logger, useLogger, Vector2, waitFor, Reference, createEffect, easeInCubic, easeInOutSine, easeOutBounce, easeInBounce } from '@motion-canvas/core';
import phung_pic from '../../assets/phung.jpg';
import { BarData, createBarGraph } from './utils';

export default makeScene2D(function* (view) {
  // Setup
  view.fill('#191919');
  const logger = useLogger();

  const textRef = createRef<Txt>();
  const imageRef = createRef<Img>();
  view.add(
    <Node cache>
      <Txt
        ref={textRef}
        text="Introduction to Psychology"
        fontFamily={'Pixel Code'}
        fontSize={100}
        fill="white"
      />,
      <Img
        ref={imageRef}
        src={phung_pic}
        scale={0.75}
        y={200}
        opacity={0}
        compositeOperation={'source-atop'}
      />
    </Node>
  );
  yield* beginSlide('word');
  yield* textRef().text('Psychology', 1, easeOutCubic).to('Sike', 1, easeInOutCubic)
  yield* beginSlide('image');
  // yield* textRef().scale(new Vector2(1.0, 1.5), 1, easeInSine);
  yield* imageRef().opacity(1, 1);
  yield* all(
    textRef().scale(200, 1),
    textRef().x(-2000, 1)
  );
  textRef().remove(); 

  const bars = createSignal([
    {
      value: createSignal(0),
      barLabel: createSignal('Predicted'),
      color: createSignal('white')
    },
    {
      value: createSignal(24),
      barLabel: createSignal('Actual'),
      color: createSignal('#3a6cc8ff')
    },
    {
      value: createSignal(26),
      barLabel: createSignal('Control 1'),
      color: createSignal('#29581fff')
    },
    {
      value: createSignal(23),
      barLabel: createSignal('Control 2'),
      color: createSignal('#29581fff')
    }
  ]);

  // Bar graph with reactive magnitude
  const barGraph = createBarGraph({
    bars: bars,
    height: createSignal(600),
    fontSize: createSignal(30),
    barWidth: createSignal(100),
    barSeparation: createSignal(50),
    position: createSignal([0, 0]),
    axisStroke: createSignal('white'),
    textFill: createSignal('white'),
    labelsDivision: createSignal(10),
    showBarValueLabels: createSignal(false),
    axisSuffix: createSignal('%'),
    magnitudeOffset: createSignal(10)
  });

  view.add(barGraph.node);

  // Animate existing bars using the individual signals
  yield* bars()[0].value(47, 3, easeInOutCubic);

  yield* waitFor(2);
});
