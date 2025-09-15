import { Camera, Circle, Img, Layout, makeScene2D, Node, Rect, Txt } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, easeInBack, easeInCubic, easeInOutCubic, easeInOutQuad, easeOutCubic, linear, loop, sequence, useRandom, Vector2, Vector2Edit, waitFor } from "@motion-canvas/core";
import shirt_img from '../../assets/vanilla ice.jpg';

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
        <>
            <Txt
                ref={titleRef}
                text="Study 4"
                fontFamily={font}
                fontSize={100}
                fill="white"
                opacity={0}
            />,
            <Txt
                ref={subtitle}
                text="anchoring and adjustment"
                fontFamily={font}
                fontSize={50}
                fill="white"
                opacity={0}
                textAlign={'center'}
                textWrap={true}
                maxWidth={view.width()*0.75}
            />
        </>
    );
    yield* titleRef().opacity(1, 1);
    yield* all(
        titleRef().y(-titleRef().fontSize() * 0.75, 1, easeInOutCubic),
        titleRef().fill(otherColor, 1, easeInOutCubic),
        subtitle().opacity(1, 1),
        subtitle().y(titleRef().fontSize() * 0.75, 1, easeInOutCubic)
    );

    yield* beginSlide('explain anchoring and adjustment');
    yield* all(
        titleRef().text('Anchoring and Adjustment', 1, easeInOutCubic),
        titleRef().scale(0.75, 1, easeInOutCubic),
        titleRef().y(-view.height()/4, 1, easeInOutCubic),
        subtitle().text('People are aware that their opinions (anchor) are subjected to the Spotlight effect, and attempts to compensate (adjustment), but undercompensates.', 1, easeInOutCubic)
    );

    yield* beginSlide('participant stats');
    yield* all(
        subtitle().opacity(0, 1, easeInOutCubic),
        titleRef().y(-view.height()/2 + titleRef().height(), 1, easeInOutCubic)
    );
    subtitle().remove();

    const participantsCount = createRef<Txt>();
    const targetParticipantsCount = createRef<Txt>();
    const participantGroups = [
        participantsCount,
        targetParticipantsCount,
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
                y={(-1+i)*100 + yOffset}
                
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
        const prependText = i == 0 ? 'All: ' : 'Groups: ';
        textTasks.push(yield loop(() => textLoop(i, prependText)));
    }
    yield* all(
        titleRef().text('Participants Composition', 1, easeInOutCubic),
        participantsCount().opacity(1, 1, easeInOutCubic),
        targetParticipantsCount().opacity(1, 1, easeInOutCubic),
    );

    for (let i = 0; i < participantGroups.length; i++) {
        cancel(textTasks[i]);
        const currentText = participantGroups[i]().text();
        participantGroups[i]().remove();
        spawnGroup(i);
        participantGroups[i]().opacity(1);
        participantGroups[i]().text(currentText);
        const text = 
            i == 0 ? 'All: 44 (Northwestern Graduates)' : 
            'Observers: confederates';
        const color = 
            i == 0 ? otherColor : 
            observersColor;
        yield* all(
            participantGroups[i]().text(text, 0.5, easeOutCubic),
            participantGroups[i]().fill(color, 0.5, easeOutCubic)
        )
    }

    yield* beginSlide('procedure setup');
    yield* chain(
        sequence(
            0.2,
            ...participantGroups.map((group, i) => {
                return group().y(view.height() + 100, 0.5, easeInBack);
            })
        ),
        titleRef().text('Procedure', 0.5, easeInOutCubic),
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
            "I'm lying!",
            "Let's pretend to be trains!",
            "I like trains!",
            "Psychology is awesome!",
            "I love psychology!",
            "Let's go!",
            "LALALA",
            "I'm not a train!",
            "These slides took way too long."
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
    yield* observerDescRef().text('1. Confederates arrive early sat at a long table.', 1, easeInOutCubic);
    const observerTask = yield loop(() => observerLoop());

    yield* all(
        targetRef().y(view.height()/2 - participantsSize, 1, easeInOutCubic),
        shirtsDescRef().text('2. Target participant arrives later wearing an "embarassing shirt" featuring Vanilla Ice.', 1, easeInOutCubic),
    );
    yield* beginSlide('wear Vanilla Ice');
    const barryPicRef = createRef<Img>();
    stage().add(
        <Img
            ref={barryPicRef}
            src={shirt_img}
            scale={0.9}
            opacity={0}
            x={-view.width() / 4}
        />
    )
    yield* barryPicRef().opacity(1, 1, easeInOutCubic);

    yield* any(
        barryPicRef().rotation(360*10, 1.1, easeInCubic),
        barryPicRef().position(targetRef().position(), 1, easeInOutCubic),
        barryPicRef().scale(0.2, 1, easeInOutCubic),
        barryPicRef().opacity(0, 1, easeInCubic),
        targetRef().fill(targetColor, 1.5, easeInOutCubic)
    );
    barryPicRef().remove();
    yield* targetRef().y(targetY, 1, easeInOutQuad);
    const movements = [] as Vector2[];
    for (let i = 0; i < observersNodeCount; i++) {
        const directionToTarget = new Vector2(-observersRefs[i].x() + targetRef().x(), -observersRefs[i].y() + targetRef().y()).normalized;
        const pupilPosition = new Vector2(directionToTarget.x * pupilMovementAmplitude, directionToTarget.y * pupilMovementAmplitude);
        movements.push(pupilPosition);
    }
    yield* sequence(
        0.5,
        all(
            ...pupilsRefs.map((ref, i) => {
                return ref.position([movements[i].x, movements[i].y], 1, easeInOutCubic);
        })),
    );
    cancel(observerTask);
    dialogueRef().remove();
    for (let i = 0; i < observersNodeCount; i++) {
        yield observersRefs[i].y(observerY, 0.2, easeInOutCubic);
    }
    yield* beginSlide('key difference');
    yield* all(
        observerDescRef().fill(controlColor, 1, easeInOutCubic),
        shirtsDescRef().fill('white', 1, easeInOutCubic),
        answersDescRef().fill('white', 1, easeInOutCubic),
        observerDescRef().text('3. Targets were then asked one of two questions after the standard survey:', 1, easeInOutCubic),
        shirtsDescRef().text('- How they arrived at their conclusion. (control question)', 1, easeInOutCubic),
        answersDescRef().text('- If they thought about any other answer.', 1, easeInOutCubic),
    );

    yield* beginSlide('results');
    yield* all(
        titleRef().text('Results', 1, easeInOutCubic),
        ...pupilsRefs.map((ref, i) => {
            return ref.opacity(0, 1, easeInOutCubic);
        }),
        observerDescRef().text('Targets\' answers:', 1, easeInOutCubic),
    );
    yield* beginSlide('question 1');
    yield* shirtsDescRef().text('- Gave reasons they think are supposed to influence their answer.', 1, easeInOutCubic);
    yield* beginSlide('question 2');
    yield* answersDescRef().text('- Three-fourths said they changed their answers, and most said their original answer was higher than the final one.', 1, easeInOutCubic);

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
                fontSize={50}
                fill="white"
                textWrap={true}
                textAlign={'center'}
            />
            <Txt
                ref={conclusion1TextRef}
                fontFamily={font}
                fontSize={50}
                fill="white"
                textWrap={true}
                textAlign={'center'}
            />
        </Layout>
    );
    yield* all(
        answersDescRef().opacity(0, 1, easeInOutCubic),
        shirtsDescRef().opacity(0, 1, easeInOutCubic),
        observerDescRef().opacity(0, 1, easeInOutCubic),
        tableRef().opacity(0, 1, easeInOutCubic),
        ...observersRefs.map((ref, i) => {
            return ref.opacity(0, 1, easeInOutCubic);
        }),
        targetRef().opacity(0, 1, easeInOutCubic),
        titleRef().text('Conclusion', 1, easeInOutCubic),
        conclusionTextRef().text('People under the Spotlight effect assume their perspective is incorrect, and tries to adjust.', 1, easeInOutCubic),
        conclusion1TextRef().text('This adjustment, however, is insufficient to offset the effect.', 1, easeInOutCubic),
    );

    yield* beginSlide('end study 4');
    yield* chain(
        titleRef().text('HOLD ON', 0.5, easeInOutCubic),
        conclusionTextRef().text('But wait... that seems like a lot of self report. ඞ', 1, easeInOutCubic),
        waitFor(0.3),
        conclusion1TextRef().text('Does the Spotlight effect always exist?', 1, easeInOutCubic),
    );

    yield* beginSlide('end');
    yield* all(
        conclusionTextRef().opacity(0, 1, easeInOutCubic),
        conclusion1TextRef().opacity(0, 1, easeInOutCubic),
        titleRef().text('', 1, easeInOutCubic),
    );
});