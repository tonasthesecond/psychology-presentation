import { Camera, makeScene2D, Txt, Node, Circle, Img, Rect, QuadBezier, Layout } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, createSignal, easeInBack, easeInCubic, easeInOutCirc, easeInOutCubic, easeInOutQuad, easeInOutSine, easeOutBack, easeOutBounce, easeOutCubic, easeOutElastic, linear, loop, PossibleVector2, Reference, sequence, useRandom, Vector2, waitFor } from "@motion-canvas/core";
import bob_img from '../../assets/bob marley.jpg';
import jerry_img from '../../assets/jerry seinfield.jpg';
import martin_img from '../../assets/martin.jpg';
import { BarData, createBarGraph } from "./utils";

export default makeScene2D(function* (view) {
    view.fill('#191919');
    const font = 'Pixel Code';
    const targetColor = '#ff5858';
    const observersColor = '#31a6ff';
    const controlColor = '#31ff34';
    const otherColor = '#ffeb39';
    const participantsSize = 75;
    const stage = createRef<Node>();
    const cameraRef = createRef<Camera>();
    const random = useRandom();

    view.add(<Node ref={stage}/>);
    view.add(
        <Camera.Stage
            cameraRef={cameraRef}
            scene={stage()}
            size={view.size()}
            fill={'#191919'}
        />
    );

    const titleRef = createRef<Txt>();
    const subtitle = createRef<Txt>();
    stage().add(
        <>
            <Txt
                ref={titleRef}
                text="Study 2"
                fontFamily={font}
                fontSize={100}
                fill="white"
                opacity={0}
            />,
            <Txt
                ref={subtitle}
                text="spotlighted appearance (non-embarrasing)"
                fontFamily={font}
                fontSize={50}
                fill="white"
                opacity={0}
            />
        </>
    );
    yield* titleRef().opacity(1, 1);
    yield* all(
        titleRef().y(-titleRef().fontSize() * 0.75, 1, easeInOutCubic),
        titleRef().fill(targetColor, 1, easeInOutCubic),
        subtitle().opacity(1, 1),
        subtitle().y(titleRef().fontSize() * 0.75, 1, easeInOutCubic)
    );

    yield* beginSlide('participant stats');
    yield* all(
        subtitle().opacity(0, 0.5, easeInOutCubic),
        titleRef().scale(0.75, 0.5, easeInOutCubic),
        titleRef().y(-view.height()/2 + titleRef().height(), 0.5, easeInOutCubic)
    );
    subtitle().remove();
    const participantsCount = createRef<Txt>();
    const targetParticipantsCount = createRef<Txt>();
    const observersCount = createRef<Txt>();
    const participantGroups = [
        participantsCount,
        targetParticipantsCount,
        observersCount,
    ]
    function spawnGroup(i: number = 0) {
        const yOffset = 125;
        view.add(
            <Txt
                ref={participantGroups[i]}
                text=""
                fontFamily={font}
                fontSize={50}
                fill="white"
                opacity={0}
                y={(-1.5+i)*100 + yOffset}
                
            />
        );
    }
    for (let i = 0; i < participantGroups.length; i++) {
        spawnGroup(i);
    }
    function* textLoop(i: number, prependText: string) {
        yield* participantGroups[i]().text(prependText + random.nextInt(100, 1000), 0.1, linear);
    }
    let textTasks = [];
    for (let i = 0; i < participantGroups.length; i++) {
        const prependText = i == 0 ? 'All: ' : i == 1 ? 'Targets: ' : 'Observers: ';
        textTasks.push(yield loop(() => textLoop(i, prependText)));
    }
    yield* all(
        titleRef().text('Participants Composition', 1, easeInOutCubic),
        participantsCount().opacity(1, 1, easeInOutCubic),
        targetParticipantsCount().opacity(1, 1, easeInOutCubic),
        observersCount().opacity(1, 1, easeInOutCubic),
    );

    yield* beginSlide('participant stats change');
    for (let i = 0; i < participantGroups.length; i++) {
        cancel(textTasks[i]);
        const currentText = participantGroups[i]().text();
        participantGroups[i]().remove();
        spawnGroup(i);
        participantGroups[i]().opacity(1);
        participantGroups[i]().text(currentText);
        const text = 
            i == 0 ? 'All: 79 (Cornell Institutions\' Students)' : 
            i == 1 ? 'Targets: 15 (6 women, 9 men)' : 
            'Observers: 64 (~5 per group)';
        const color = 
            i == 0 ? otherColor : 
            i == 1 ? targetColor : 
            observersColor;
        yield* all(
            participantGroups[i]().text(text, 0.5, easeOutCubic),
            participantGroups[i]().fill(color, 0.5, easeOutCubic)
        )
    }

    yield* beginSlide('procedure setup');
    yield* all(
        titleRef().text('Procedure', 1, easeInOutCubic),
        ...participantGroups.map((group) => {
            return group().y(view.height() + 100, 1, easeInBack)
        })
    )
    participantGroups.forEach((group) => {
        group().remove();
    })

    // yield* beginSlide('participants choice')
    const targetRef = createRef<Circle>();
    stage().add(
        <Circle
            ref={targetRef}
            fill={'white'}
            size={participantsSize}
            x={-view.width()/2 - participantsSize/2}
        />
    );
    yield* cameraRef().centerOn(targetRef(), 1, easeInOutCubic);
    
    const shirtRefs = createRefArray<Img>();
    const shirtImgs = [
        bob_img,
        jerry_img,
        martin_img,
    ]
    const shirtDimensions = [
        [1080, 1350],
        [474, 842],
        [474, 678],
    ]
    for (let i = 0; i < shirtImgs.length; i++) {
        stage().add(
            <Img
                ref={shirtRefs}
                src={shirtImgs[i]}
                radius={100}
                size={[
                    participantsSize,
                    shirtDimensions[i][1] * participantsSize/shirtDimensions[i][0]
                ]}
                position={[
                    -view.width()/2 - participantsSize/2, 
                    -view.height()/2 - participantsSize
                ]}
            />
        );
    }
    const orbitRadius = 300;
    const orbitTime = createSignal(0);
    for (let i = 0; i < shirtImgs.length; i++) {
        yield chain(
            waitFor(0.5*i),
            shirtRefs[i].position(() => [
                targetRef().x() + orbitRadius * Math.cos(orbitTime() + 2 * Math.PI * i/shirtImgs.length),
                targetRef().y() + orbitRadius * Math.sin(orbitTime() + 2 * Math.PI * i/shirtImgs.length),
            ], 1, easeInOutCubic),
        );
    }
    var orbitTask = yield loop(() => {
        orbitTime(orbitTime() + 0.01);
    });
    yield* waitFor(2);
    yield* all(
        ...shirtRefs.map((shirt) => {
            return all(
                shirt.radius(0, 1, easeInOutCubic),
                shirt.scale(3, 1, easeInOutCubic),
            );
        })
    );

    yield* beginSlide('wears shirts');
    cancel(orbitTask);
    yield* all(
        ...shirtRefs.map((shirt, i) => {
            return any(
                shirt.rotation(360*2, 0.5, easeInCubic),
                shirt.position(targetRef().position(), 0.5, easeInOutCubic),
                shirt.scale(0, 0.5, easeInOutCubic),
                targetRef().fill(targetColor, 0.5, easeInOutCubic),
            );
        })
    );
    shirtRefs.forEach((shirt) => {
        shirt.remove();
    })
    
    const observersNodeCount = 5;
    const observersRefs = createRefArray<Circle>();
    const tableRef = createRef<Rect>();

    const observerSeparation = 20;
    const rowSeparation = 20;
    const tableHeight = 120;
    const tableWidth = participantsSize * observersNodeCount + observerSeparation * (observersNodeCount - 1);

    const xOffset = 400;
    const yOffset = 40;
    
    stage().add(
        <Rect
        ref={tableRef}
            width={tableWidth}
            height={tableHeight}
            fill={'#fff8f8'}
            opacity={1}
            position={[
                xOffset,
                yOffset
            ]}
        />
    )
    const observerY = yOffset - participantsSize/2 - rowSeparation - tableHeight/2;
    for (let i = 0; i < observersNodeCount; i++) {
        const observerX = tableWidth/2 + xOffset*2 - (tableRef().x() + participantsSize / 2 + i * (participantsSize + observerSeparation));
        stage().add(
            <Circle
                ref={observersRefs}
                size={participantsSize}
                fill={observersColor}
                opacity={1}
                position={[observerX, observerY]}
            />
        );
    }
    yield* all(
        targetRef().fill(targetColor, 1, easeInOutCubic),
        targetRef().x(-view.width()/3, 1, easeInOutCubic),
        cameraRef().centerOn([0, 0], 1, easeInOutCubic),
    );
    const targetY = yOffset + tableHeight/2 + participantsSize/2 + rowSeparation;
    const pathToTableRef = createRef<QuadBezier>();
    const progress = createSignal(0);
    stage().add(
        <QuadBezier
            ref={pathToTableRef}
            p0={targetRef().position()}
            p1={[-560, 200]}
            p2={[xOffset, targetY]}
        />
    );
    targetRef().position(() => pathToTableRef().getPointAtPercentage(progress()).position);
    // yield* progress(1, 1, easeInOutSine);
    const fontSize = 40;
    const layoutRef = createRef<Layout>();
    const observerDescRef = createRef<Txt>();
    const shirtsDescRef = createRef<Txt>();
    const answersDescRef = createRef<Txt>();
    stage().add(
        <Layout
            ref={layoutRef}
            layout={true}
            maxWidth={700}
            x={-300}
            y={yOffset}
            direction={'column'}
            rowGap={fontSize}
        >
            <Txt
                ref={observerDescRef}
                fontFamily={font}
                fontSize={fontSize}
                fill={observersColor}
                opacity={1}
                textWrap={true}
            />
            <Txt
                ref={shirtsDescRef}
                fontFamily={font}
                fontSize={fontSize}
                fill={targetColor}
                opacity={1}
                textWrap={true}
            />
            <Txt
                ref={answersDescRef}
                fontFamily={font}
                fontSize={fontSize}
                fill={otherColor}
                opacity={1}
                textWrap={true}
            />
        </Layout>
    )
    yield* all(
        progress(1, 1, easeInOutSine),
        observerDescRef().text('1. Target participants wore a shirt they rated on a 9-point scale.', 1, easeInOutCubic),
        shirtsDescRef().text('2. A shirt includes a picture of either Bob Marley, Jerry Seinfield, or Martin Luther King Jr.', 1, easeInOutCubic),
        answersDescRef().text('3. Participants were then asked to estimate observer perception, same with Study 1.', 1, easeInOutCubic),
    );

    yield* beginSlide('show graph');
    const bars = createSignal([
        {
            value: createSignal(0),
            barLabel: createSignal('Targets'),
            color: createSignal(targetColor)
        },
        {
            value: createSignal(7),
            barLabel: createSignal('Observers'),
            color: createSignal(observersColor)
        },
    ] as BarData[]);
    
    // Bar graph with reactive magnitude
    const magnitudeOffset = createSignal(0);
    const barGraph = createBarGraph({
        bars: bars,
        height: createSignal(600),
        fontSize: createSignal(24),
        barWidth: createSignal(100),
        barSeparation: createSignal(100),
        position: createSignal([0, 0]),
        axisStroke: createSignal('white'),
        textFill: createSignal('white'),
        labelsDivision: createSignal(10),
        showBarValueLabels: createSignal(false),
        axisSuffix: createSignal('%'),
        magnitudeOffset: magnitudeOffset
    });
    stage().add(barGraph.node);
    barGraph.node.opacity(0);
    yield* all(
        layoutRef().x(-view.width(), 1, easeInBack),
        sequence(
            0.1,
            ...observersRefs.map((ref, i) => {
                return ref.x(view.width(), 1, easeInBack);
            })
        ),
        targetRef().x(view.width(), 1, easeInBack),
        tableRef().x(0, 1, easeInOutCubic),
    );
    yield* all(
        titleRef().text('Results', 0.5, easeInOutCubic),
        barGraph.node.opacity(1, 0.5, easeInCubic),
        tableRef().size([1200, 800], 0.5, easeInOutCubic),
        tableRef().opacity(0, 0.5, easeOutCubic),
        tableRef().rotation(360*4, 1, easeInCubic),
    );

    const hypothesisTextRef = createRef<Txt>();
    stage().add(
        <Txt
            ref={hypothesisTextRef}
            fontFamily={font}
            fontSize={barGraph.fontSize()}
            fill="white"
            position={[
                0,
                420 + barGraph.fontSize()*1.5
            ]}
        />
    )

    // yield* beginSlide('hypothesis');
    yield* hypothesisTextRef().text('Hypothesis: Targets overestimate rating.', 1, easeInOutCubic);

    yield* beginSlide('show result');
    yield* all(
        bars()[0].value(45, 2, easeOutElastic),
        magnitudeOffset(10, 2, easeOutElastic),
        chain(
            hypothesisTextRef().fill(targetColor, 0.5, easeInCubic),
            hypothesisTextRef().fill('white', 0.5, easeOutCubic),
        ),
        hypothesisTextRef().text('Targets\' estimates are six times higher.', 1, easeInOutCubic),
    );
    
    yield* beginSlide('conclusion');
    const conclusionTextRef = createRef<Txt>();
    const conclusion1TextRef = createRef<Txt>();
    stage().add(
        <Layout
            ref={layoutRef}
            layout={true}
            direction={'column'}
            gap={48*2}
            maxWidth={view.width()/1.5}
            y={yOffset*2}
        >
            <Txt
                ref={conclusionTextRef}
                fontFamily={font}
                fontSize={40}
                fill="white"
                textWrap={true}
            />
            <Txt
                ref={conclusion1TextRef}
                fontFamily={font}
                fontSize={40}
                fill="white"
                textWrap={true}
            />
        </Layout>
    );
    yield* all(
        barGraph.ref().opacity(0, 1, easeInOutCubic),
        titleRef().text('Conclusion', 1, easeInOutCubic),
        hypothesisTextRef().y(view.height(), 1, easeInOutCubic),
        conclusionTextRef().text('Spotlight effect exists even in non-embarassing situations.', 1, easeInOutCubic),
        // conclusion1TextRef().text('', 1, easeInOutCubic),
    );

    yield* beginSlide('end');
    yield* all(
        cameraRef().zoom(200, 2, easeInCubic),
        cameraRef().position([0, 35], 2, easeInCubic),
    );
    view.removeChildren();
});
