import { Camera, Circle, Gradient, Layout, Line, makeScene2D, Node, Txt } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, createSignal, easeInBack, easeInBounce, easeInCubic, easeInElastic, easeInOutBounce, easeInOutCirc, easeInOutCubic, easeOutBack, easeOutCirc, easeOutCubic, linear, loop, sequence, useRandom, Vector2, waitFor } from "@motion-canvas/core";

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
                text="Study 3"
                fontFamily={font}
                fontSize={100}
                fill="white"
                opacity={0}
            />,
            <Txt
                ref={subtitle}
                text="spotlighted behavior"
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
        titleRef().fill(observersColor, 1, easeInOutCubic),
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
        titleRef().text('Participants Composition', 0.5, easeInOutCubic),
        participantsCount().opacity(1, 0.5, easeInOutCubic),
        targetParticipantsCount().opacity(1, 0.5, easeInOutCubic),
    );
    for (let i = 0; i < participantGroups.length; i++) {
        cancel(textTasks[i]);
        const currentText = participantGroups[i]().text();
        participantGroups[i]().remove();
        spawnGroup(i);
        participantGroups[i]().opacity(1);
        participantGroups[i]().text(currentText);
        const text = 
            i == 0 ? 'All: 193 (Cornell Undergraduates)' : 
            'Groups: 42 (mostly 4-5 per group)';
        const color = 
            i == 0 ? otherColor : 
            i == 1 ? targetColor : 
            observersColor;
        yield* all(
            participantGroups[i]().text(text, 0.5, easeOutCubic),
            participantGroups[i]().fill(color, 0.5, easeOutCubic)
        )
    }

    yield* beginSlide('procedure descriptions');
    const tableRef = createRef<Circle>();
    const participantsRef = createRefArray<Circle>();
    const timerRef = createRef<Txt>();

    const participantsNodeCount = 6;
    const participantsSize = 75;
    const tableSize = 300;
    const xOffset = -400;
    const yOffset = 100;

    stage().add(
        <Circle
            ref={tableRef}
            size={tableSize}
            fill={'#ffffff'}
            opacity={1}
            position={[
                xOffset,
                view.height() + tableSize/2
            ]}
        >
            {/* <Txt
                ref={timerRef}
                fontFamily={font}
                fontSize={50}
                fill={'black'}
                opacity={1}
                text="30:00"
            /> */}
        </Circle>
    );

    yield* all(
        tableRef().position([xOffset, yOffset], 1, easeInOutCubic),
        participantGroups[0]().x(-view.width(), 1, easeInOutCubic),
        participantGroups[1]().x(view.width(), 1, easeInOutCubic),
    );

    // Position participants around the circle
    const radius = tableSize/2 + participantsSize;
    for (let i = 0; i < participantsNodeCount; i++) {
        stage().add(
            <Circle
                ref={participantsRef}
                size={participantsSize}
                fill={observersColor}
                opacity={0}
                position={[
                    xOffset + radius * Math.cos(2 * Math.PI / participantsNodeCount * i),
                    yOffset + radius * Math.sin(2 * Math.PI / participantsNodeCount * i),
                ]}
            />
        );
    }

    const dialogueRef = createRef<Txt>();
    function* discussionLoop() {
        const randomParticipant = participantsRef[random.nextInt(0, participantsNodeCount)];
        const dialogueFontSize = 24;
        const jumpHeight = 10;
        const dialogues = [
            "That's actually a really good point about urban infrastructure.",
            "I think we should focus on education funding first.",
            "Has anyone considered the economic implications here?",
            "Let me build on what Sarah just said...",
            "We're making good progress on this policy draft.",
            "I feel like I'm talking too much...",
            "Did that come out wrong?",
            "I probably should have phrased that better.",
            "Am I making sense here?",
            "Sorry, I'm rambling again.",
            "Well, that's completely wrong because...",
            "I strongly disagree with that approach.",
            "That's not really how economics works...",
            "Can we get back on topic please?",
            "I think you're missing the bigger picture.",
            "We only have 5 minutes left to finish this.",
            "Should we start writing the policy statement?",
            "Everyone needs to sign off on this draft.",
            "We need to reach consensus soon.",
            "I wonder how the other groups are doing...",
            "This is harder than I thought it would be.",
            "At least we all have to participate equally.",
            "What about community policing programs?",
            "Housing costs are definitely the main issue here.",
            "I'm not sure that statistic is accurate...",
            "Transportation access is huge too.",
            "Maybe we should prioritize these solutions?",
            "I think we're overcomplicating this.",
            "Does everyone agree with this point?"
        ]
        const randomDialogue = dialogues[random.nextInt(0, dialogues.length)];
        stage().add(
            <Txt
                ref={dialogueRef}
                text={randomDialogue}
                fontFamily={font}
                fontSize={dialogueFontSize}
                fill={'#7fff3fff'}
                shadowColor={'#000'}
                shadowBlur={0}
                shadowOffset={[2, 2]}
                maxWidth={200}
                textWrap={true}
                opacity={1}
                position={[
                    randomParticipant.x(),
                    randomParticipant.y() - participantsSize/2 - dialogueFontSize*3 - jumpHeight*2
                ]}
            />
        );
        // randomObs do a little jump
        const currentY = randomParticipant.y();
        yield* chain(
            randomParticipant.y(
                currentY - jumpHeight,
                0.2,
                easeOutCubic
            ),
            randomParticipant.y(
                currentY,
                0.2,
                easeInCubic
            )
        )
        yield* waitFor(1);
        dialogueRef().remove();
    }
    yield* all(
        ...participantsRef.map((ref) => {
            return ref.opacity(1, 1, easeInOutCubic);
        })
    );

    const discussionTask = yield loop(() => discussionLoop());

    // yield* beginSlide('procedure descriptions');
    const layoutRef = createRef<Layout>();
    const textRef = createRefArray<Txt>();

    stage().add(
        <Layout
            ref={layoutRef}
            layout={true}
            direction={'column'}
            gap={0}
            maxWidth={800}
            position={[
                350,
                yOffset
            ]}
        />
    );
    for (let i = 0; i < 6; i++) {
        layoutRef().add(
            <Txt
                ref={textRef}
                fontFamily={font}
                fontSize={40}
                fill={'#191919'}
                textWrap={true}
            />
        )
    }

    yield* all(
        titleRef().text('Procedure Description', 0.5, easeInOutCubic),
        ...textRef.map((ref) => {
            return chain(
                ref.fill('84d8ff', 0.5, easeInCubic),
                ref.fill('white', 0.5, easeOutCubic), 
            );
        }),
        textRef[0].text('Groups discuss: "problems of inner cities".', 1, easeInOutCubic),
        textRef[1].text('---', 1, easeInOutCubic),
        textRef[2].text('They are expected to write and sign a shared policy draft.', 1, easeInOutCubic),
        textRef[3].text('---', 1, easeInOutCubic),
        textRef[4].text('Each student then ranks other group members, and estimates how others would rank themselves.', 1, easeInOutCubic),
        textRef[5].text('---', 1, easeInOutCubic),
    );

    yield* beginSlide('show questions');
    const questions = [
        "Who advanced the discussion the most?",
        "Who made the most speech errors?",
        "Who made the most offensive comments?",
        "Who made comments that would be critically judged?",
        "Estimate percentage of time spent speaking.",
        "Which commmens were most remarkable?"
    ]
    yield* all(
        titleRef().text('Survey Questions', 1, easeInOutCubic),
        layoutRef().gap(32, 1, easeInOutCubic),
        ...textRef.map((ref, i) => {
            return any(
                chain(
                    ref.fill('84d8ff', 0.5, easeInCubic),
                    ref.fill('white', 0.5, easeOutCubic), 
                ),
                ref.text(questions[i], 1, easeInOutCubic),
            );
        }),
    );
    
    yield* beginSlide('show table');
    
    const transRef = createRef<Circle>();
    stage().add(
        <Circle
            ref={transRef}
            fill={'191919'}
            position={tableRef().position()}
            size={0}
        />
    );

    cancel(discussionTask);
    yield* sequence(
        0.7,
        chain(
            all(
                cameraRef().zoom(1.5, 0.5, easeInOutCubic),
                cameraRef().centerOn(tableRef(), 0.5, easeInOutCubic),
            ),
            all(
                cameraRef().rotation(360, 1, easeInOutCubic),
                cameraRef().zoom(40, 1, easeInOutCubic),
            ),
        ),
        transRef().size(80, 1, easeInOutCirc),
    );
    stage().removeChildren();
    view.add(
        <Camera.Stage
            cameraRef={cameraRef}
            scene={stage()}
            size={view.size()}
            fill={'#191919'}
        />
    );
    const columnGap = createSignal(64);
    const rowGap = 32;
    const fontSize = 32;
    const maxWidth = 250;

    stage().add(
        <Layout
            ref={layoutRef}
            layout={true}
            direction={'column'}
            gap={rowGap}
            y={fontSize}
            opacity={0}
        >
            {/* Header Row */}
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Dimension" fontSize={fontSize} fontWeight={700} width={maxWidth} fill={targetColor} textWrap={true} fontFamily={font} />
                <Txt text="Predicted standing" fontSize={fontSize} fontWeight={700} width={maxWidth} textAlign={'center'} fill={targetColor} textWrap={true} fontFamily={font} />
                <Txt text="Actual standing" fontSize={fontSize} fontWeight={700} width={maxWidth} textAlign={'center'} fill={targetColor} textWrap={true} fontFamily={font} />
                <Txt text="Difference" fontSize={fontSize} fontWeight={700} width={maxWidth} textAlign={'center'} fill={targetColor} textWrap={true} fontFamily={font} />
                <Txt text="Mean correlation" fontSize={fontSize} fontWeight={700} width={200} textAlign={'center'} fill={targetColor} textWrap={true} fontFamily={font}/>
            </Layout>
            
            {/* Separator Line */}
            <Line
                points={[[-400, 0], [1100, 0]]}
                stroke={'#333'}
                lineWidth={2}
            />
            
            {/* Data Rows */}
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Advance discussion" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="2.69" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.84" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="-0.15 *" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".79 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
            
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Speech errors" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="2.30" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.96" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="-0.66 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".34 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
            
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Offensive comments" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="2.35" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.90" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="-0.55 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".65 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
            
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Judgable comments" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="2.61" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.82" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="-0.21 *" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".51 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
            
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Remarkable comments" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="3.93" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.76" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="1.17 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".47 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
            
            <Layout direction={'row'} gap={() => columnGap()}>
                <Txt text="Talking percentage" fontSize={fontSize} width={maxWidth} fontFamily={font} fill={'#cccccc'} textWrap={true}/>
                <Txt text="23.05" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="20.96" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text="2.09 *" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
                <Txt text=".75 **" fontSize={fontSize} width={maxWidth} textAlign={'center'} fontFamily={font} fill={'#cccccc'} />
            </Layout>
        </Layout>
    );
    const fadeOpacity = 0.3;
    yield* layoutRef().opacity(1, 0.5, easeInOutCubic);
    yield* beginSlide('highlight standings');
    yield* all(
        ...layoutRef().children().map((ref) => {
            return all(
                ...ref.children().map((txt, i) => {
                    if (i == 3 || i == 4) {
                        return txt.opacity(fadeOpacity, 1, easeInOutCubic);
                    }
                })
            );
        })
    );
    yield* beginSlide('highlight difference');
    yield* all(
        ...layoutRef().children().map((ref) => {
            return all(
                ...ref.children().map((txt, i) => {
                    if (i == 1 || i == 2) {
                        return txt.opacity(fadeOpacity, 1, easeInOutCubic);
                    } else if (i == 3) {
                        return txt.opacity(1, 1, easeInOutCubic);
                    }
                })
            );
        }),
        ...layoutRef().children().map((ref, j) => {
            return all(
                ...ref.children().map((txt: Txt, i) => {
                    if (i !== 3) return;
                    if (j == 2 || j == 3 || j == 4 || j == 5) {
                        return txt.fill(targetColor, 1, easeInOutCubic);
                    } else if (j == 6 || j == 7) {
                        return txt.fill(observersColor, 1, easeInOutCubic);
                    }
                })
            );
        })
    );
    yield* beginSlide('comment');
    const commentRef = createRef<Txt>();
    stage().add(
        <Txt
            ref={commentRef}
            fontFamily={font}
            fontSize={fontSize}
            fill="white"
            position={[
                0,
                view.height()/2 - fontSize*3
            ]}
        />
    );
    yield* all(
        layoutRef().y(-yOffset/2, 1, easeInOutCubic),
        commentRef().text('Self-estimates are realistic, but still inflated.', 1, easeInOutCubic),
        ...layoutRef().children().map((ref, j) => {
            return all(
                ...ref.children().map((txt: Txt, i) => {
                    return txt.opacity(1, 1, easeInOutCubic);
                })
            );
        }),
    );
    
    yield* beginSlide('conclusion');
    yield* all(
        layoutRef().opacity(0, 1, easeInOutCubic),
        commentRef().y(view.height()/2 + 4*fontSize, 0.7, easeInBack),
    );
    layoutRef().remove();
    commentRef().remove();

    stage().add(
        <>
            <Txt
                ref={titleRef}
                text="Conclusion"
                fontFamily={font}
                fontSize={75}
                fill={observersColor}
                y={-view.height()/2 + 100}
                opacity={0}
            />
            <Txt
                ref={subtitle}
                text="Strongly suggests the existence of the Spotlight effect in terms of behavioral perception."
                fontFamily={font}
                fontSize={40}
                fill="white"
                y={yOffset}
                maxWidth={1200}
                textWrap={true}
                opacity={0}
                textAlign={'center'}
            />
        </>
    );
    yield* all(
        titleRef().opacity(1, 1, easeInOutCubic),
        subtitle().opacity(1, 1, easeInOutCubic),
    );

    yield* beginSlide('end');
    yield* all(
        titleRef().opacity(0, 1, easeInOutCubic),
        subtitle().opacity(0, 1, easeInOutCubic),
    );
    view.removeChildren();
    
});