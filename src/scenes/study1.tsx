import { makeScene2D, Txt, Node, Circle, Rect, Layout, Img, Camera } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, createSignal, delay, easeInBack, easeInBounce, easeInCirc, easeInCubic, easeInElastic, easeInOutBounce, easeInOutCirc, easeInOutCubic, easeInOutQuad, easeOutCubic, linear, loop, sequence, spawn, useLogger, useRandom, Vector2, waitFor } from "@motion-canvas/core";
import barry_img from '../../assets/barry manilow.jpg';
import { BarData, createBarGraph } from "./utils";

export default makeScene2D(function* (view) {
    view.fill('#191919');
    const random = useRandom();
    const font = 'Pixel Code'
    const targetColor = '#ff5858';
    const observersColor = '#31a6ff';
    const controlColor = '#31ff34';
    const otherColor = '#ffeb39';
    const stage = createRef<Node>();
    const cameraRef = createRef<Camera>();
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
        <Node>
            <Txt
                ref={titleRef}
                text="Study 1"
                fontFamily={font}
                fontSize={100}
                fill="white"
                opacity={0}
            />
            <Txt
                ref={subtitle}
                text="spotlighted appearance"
                fontFamily={font}
                fontSize={50}
                fill="white"
                opacity={0}
            />
        </Node>
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
        subtitle().opacity(0, 1, easeInOutCubic),
        titleRef().scale(0.75, 1, easeInOutCubic),
        titleRef().y(-view.height()/2 + titleRef().height(), 1, easeInOutCubic)
    );
    subtitle().remove();
    const participantsCount = createRef<Txt>();
    const targetParticipantsCount = createRef<Txt>();
    const observersCount = createRef<Txt>();
    const controlCount = createRef<Txt>();
    const participantGroups = [
        participantsCount,
        targetParticipantsCount,
        observersCount,
        controlCount
    ]
    function spawnGroup(i: number = 0) {
        const yOffset = 125;
        stage().add(
            <Txt
                ref={participantGroups[i]}
                text=""
                fontFamily={font}
                fontSize={50}
                fill="white"
                opacity={0}
                y={(-2+i)*100 + yOffset}
                
            />
        );
    }
    for (let i = 0; i < 4; i++) {
        spawnGroup(i);
    }
    function* textLoop(i: number, prependText: string) {
        yield* participantGroups[i]().text(prependText + random.nextInt(100, 1000), 0.1, linear);
    }
    let textTasks = [];
    for (let i = 0; i < 4; i++) {
        const prependText = i == 0 ? 'All: ' : i == 1 ? 'Targets: ' : i == 2 ? 'Observers: ' : 'Controls: ';
        textTasks.push(yield loop(() => textLoop(i, prependText)));
    }
    yield* all(
        titleRef().text('Participants Composition', 1, easeInOutCubic),
        participantsCount().opacity(1, 1, easeInOutCubic),
        targetParticipantsCount().opacity(1, 1, easeInOutCubic),
        observersCount().opacity(1, 1, easeInOutCubic),
        controlCount().opacity(1, 1, easeInOutCubic)
    );

    yield* beginSlide('participant stats change');
    for (let i = 0; i < 4; i++) {
        cancel(textTasks[i]);
        const currentText = participantGroups[i]().text();
        participantGroups[i]().remove();
        spawnGroup(i);
        participantGroups[i]().opacity(1);
        participantGroups[i]().text(currentText);
        const text = 
            i == 0 ? 'All: 109 (Cornell Undergraduates)' : 
            i == 1 ? 'Targets: 15 (8 women, 7 men)' : 
            i == 2 ? 'Observers: 64 (~5 per group)' 
            : 'Controls: 30 (2 conditions)';
        const color = 
            i == 0 ? otherColor : 
            i == 1 ? targetColor : 
            i == 2 ? observersColor : 
            controlColor;
        yield* all(
            participantGroups[i]().text(text, 1, easeOutCubic),
            participantGroups[i]().fill(color, 1, easeOutCubic)
        )
    }

    yield* beginSlide('procedure setup');
    yield* chain(
        sequence(
            0.3,
            ...participantGroups.map((group, i) => {
                return group().y(view.height() + 100, 1, easeInBack);
            })
        ),
        titleRef().text('Procedure', 1, easeInOutCubic),
    );
    
    const observersNodeCount = 5;
    const observersRefs = createRefArray<Circle>();
    const pupilsRefs = createRefArray<Circle>();
    const tableRef = createRef<Rect>();
    const targetRef = createRef<Circle>();

    const participantsSize = 75;
    const observerSeparation = 20;
    const rowSeparation = 20;
    const tableHeight = 120;
    const tableWidth = participantsSize * observersNodeCount + observerSeparation * (observersNodeCount - 1);
    const pupilMovementAmplitude = 16

    const xOffset = 400;
    const yOffset = 40;
    
    stage().add(
        <Rect
        ref={tableRef}
            width={0}
            height={0}
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
                opacity={0}
                position={[observerX, observerY]}
            >
                <Circle
                    ref={pupilsRefs}
                    size={participantsSize/2.5}
                    fill={'black'}
                    opacity={1}
                    position={[0, 0]}
                />
            </Circle>
        );
    }
    const targetY = yOffset + tableHeight/2 + participantsSize/2 + rowSeparation;
    stage().add(
        <Circle
        ref={targetRef}
            size={participantsSize}
            fill={'white'}
            opacity={0}
            position={[
                xOffset,
                view.height()/2 + participantsSize/2
            ]}
            />
    );
    const dialogueRef = createRef<Txt>();
    function* observerLoop() {
        const randomObs = observersRefs[random.nextInt(0, observersNodeCount)];
        const dialogueFontSize = 32;
        const jumpHeight = 10;
        const dialogues = [
            "Hello!",
            "What's up?",
            "😂",
            "😎",
            "I like trains!",
            "Psychology is awesome!",
            "I love psychology!",
            "Let's go!",
        ]
        const randomDialogue = dialogues[random.nextInt(0, dialogues.length)];
        stage().add(
            <Txt
                ref={dialogueRef}
                text={randomDialogue}
                fontFamily={font}
                fontSize={dialogueFontSize}
                fill="white"
                opacity={1}
                position={[
                    randomObs.x(),
                    randomObs.y() - participantsSize/2 - dialogueFontSize - jumpHeight*2
                ]}
            />
        );
        // randomObs do a little jump
        yield* chain(
            randomObs.y(
                observerY - jumpHeight,
                0.2,
                easeOutCubic
            ),
            randomObs.y(
                observerY,
                0.2,
                easeInCubic
            )
        )
        dialogueRef().remove();
        
        // Move observer pupils randomly
        const usedPupils = [] as Circle[];
        for (let i = 0; i < random.nextInt(2, 5); i++) {
            var randomPupil = pupilsRefs[random.nextInt(0, observersNodeCount)];
            while (usedPupils.includes(randomPupil)) {
                randomPupil = pupilsRefs[random.nextInt(0, observersNodeCount)];
            }
            const randomX = random.nextFloat(-pupilMovementAmplitude, pupilMovementAmplitude);
            const randomY = random.nextFloat(-pupilMovementAmplitude, pupilMovementAmplitude);
            yield randomPupil.position([randomX, randomY], random.nextFloat(0.1, 0.3), easeInOutCubic);
            usedPupils.push(randomPupil);
        }

        yield* waitFor(0.3);
    }
    // yield* beginSlide('observer enters');
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
        tableRef().width(tableWidth, 1, easeInOutQuad),
        tableRef().height(tableHeight, 1, easeInOutQuad),
        targetRef().opacity(1, 1, easeInOutCubic),
        ...observersRefs.map((ref) => ref.opacity(1, 1, easeInOutCubic)),
    );
    yield* observerDescRef().text('1. Observers arrive 5m early sat at a long table.', 1, easeInOutCubic);
    const observerTask = yield loop(() => observerLoop());
    
    yield* beginSlide('target arrives');
    yield* all(
        targetRef().y(view.height()/2 - participantsSize, 1, easeInOutCubic),
        shirtsDescRef().text('2. Target participant arrives later wearing an "embarassing shirt" featuring Barry Manilow.', 1, easeInOutCubic),
    );
    yield* beginSlide('show Barry Manilow');
    const barryPicRef = createRef<Img>();
    stage().add(
        <Img
            ref={barryPicRef}
            src={barry_img}
            scale={0.9}
            opacity={0}
            x={-view.width() / 4}
        />
    )
    yield* barryPicRef().opacity(1, 0.3, easeInOutCubic);

    yield* beginSlide('wears shirt');
    yield* any(
        barryPicRef().rotation(360*10, 1.1, easeInCubic),
        barryPicRef().position(targetRef().position(), 1, easeInOutCubic),
        barryPicRef().scale(0.2, 1, easeInOutCubic),
        barryPicRef().opacity(0, 1, easeInCubic),
        targetRef().fill(targetColor, 1.5, easeInOutCubic)
    );
    // yield* targetRef().y(targetY, 1, easeInOutQuad);
    
    const movements = [] as Vector2[];
    for (let i = 0; i < observersNodeCount; i++) {
        const directionToTarget = new Vector2(-observersRefs[i].x() + targetRef().x(), -observersRefs[i].y() + targetRef().y()).normalized;
        const pupilPosition = new Vector2(directionToTarget.x * pupilMovementAmplitude, directionToTarget.y * pupilMovementAmplitude);
        movements.push(pupilPosition);
    }
    yield* all(
        targetRef().y(targetY, 1, easeInOutQuad),
        cameraRef().zoom(1.1, 1, easeInOutCubic),
        cameraRef().centerOn(tableRef(), 0.6, easeInOutCubic),
    )
    dialogueRef().remove();
    for (let i = 0; i < observersNodeCount; i++) {
        yield observersRefs[i].y(observerY, 0.2, easeInOutCubic);
    }
    cancel(observerTask);
    yield* sequence(
        0.5,
        all(
        ...pupilsRefs.map((ref, i) => {
            return ref.position([movements[i].x, movements[i].y], 1, easeInOutCubic);
        })),
    );
    yield* chain(
        targetRef().y(targetY + 100, 1, easeInOutCubic),
        cameraRef().reset(1, easeInOutCubic),
    );
    // yield* beginSlide('answers');
    barryPicRef().position(targetRef().position());
    yield* all(
        answersDescRef().text('3. Surveys later ask participants the number of observers they think had noticed the shirt.', 1, easeInOutCubic),
        chain(
            barryPicRef().opacity(1, 1, easeInCubic),
            barryPicRef().opacity(0, 0.5, easeInOutCubic),
        ),
    );
    barryPicRef().remove();
    
    yield* beginSlide('show graph');
    const bars = createSignal([
        {
            value: createSignal(0),
            barLabel: createSignal('Targets'),
            color: createSignal(targetColor)
        },
        {
            value: createSignal(24),
            barLabel: createSignal('Observers'),
            color: createSignal(observersColor)
        },
        {
            value: createSignal(26),
            barLabel: createSignal('Control 1'),
            color: createSignal(controlColor)
        },
        {
            value: createSignal(23),
            barLabel: createSignal('Control 2'),
            color: createSignal(controlColor)
        }
    ] as BarData[]);
    
    // Bar graph with reactive magnitude
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
        magnitudeOffset: createSignal(10)
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
    yield* tableRef().size([1200, 800], 0.5, easeInOutCubic),
    yield* all(
        titleRef().text('Results', 0.5, easeInOutCubic),
        barGraph.node.opacity(1, 0.5, easeInOutCubic),
        tableRef().opacity(0, 0.5, easeInOutCubic),
    );

    // yield* beginSlide('explain controls');
    const control1TextRef = createRef<Txt>();
    const control2TextRef = createRef<Txt>();
    stage().add(
        <>
            <Txt
                ref={control1TextRef}
                fontFamily={font}
                fontSize={barGraph.fontSize()}
                fill="white"
                position={[
                    0,
                    420
                ]}
            />
            <Txt
                ref={control2TextRef}
                fontFamily={font}
                fontSize={barGraph.fontSize()}
                fill="white"
                position={[
                    0,
                    420 + barGraph.fontSize()*2
                ]}
            />
        </>
    )
    yield* all(
        control1TextRef().text('Control 1 was asked whether observers would know the identity of the person on the shirt.', 1, easeInOutCubic),
        control2TextRef().text('Control 2 was asked whether observers would know that it was Barry Manilow on the shirt.', 1, easeInOutCubic),
    )

    yield* beginSlide('hypothesis');
    yield* all(
        control1TextRef().text('Hypothesis: Target would overestimate.', 1, easeInOutCubic),
        control2TextRef().y(view.height(), 1, easeInOutCubic),
        control1TextRef().y(420 + barGraph.fontSize()*1.5, 1, easeInOutCubic),
    );

    yield* beginSlide('show result');
    yield* bars()[0].value(47, 3, easeInOutCubic);
    
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
        control1TextRef().y(view.height(), 1, easeInOutCubic),
        conclusionTextRef().text('Strong evidence for the existence of the Spotlight effect.', 1, easeInOutCubic),
        conclusion1TextRef().text('Control groups show that the salience of the shirt isn\'t a major factor.', 1, easeInOutCubic),
    );

    yield* beginSlide('end');
    yield* all(
        titleRef().text('', 1, easeInOutCubic),
        conclusionTextRef().text('', 1, easeInOutCubic),
        conclusion1TextRef().text('', 1, easeInOutCubic),
    );
    view.removeChildren();
});