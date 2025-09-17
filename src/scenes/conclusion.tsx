import { Camera, Circle, Img, Layout, Line, makeScene2D, Node, Path, Rect, Txt } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, createSignal, easeInBack, easeInCubic, easeInOutCubic, easeInOutQuad, easeInOutSine, easeOutCubic, linear, loop, sequence, useRandom, Vector2, Vector2Edit, waitFor } from "@motion-canvas/core";

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
    stage().add(
        <Txt
            ref={titleRef}
            text="Conclusion"
            fontFamily={font}
            fontSize={75}
            fill={targetColor}
            opacity={0}
            y={() => -view.height() / 2 + titleRef().fontSize()}
        />
    );
    yield* titleRef().opacity(1, 1, easeInOutCubic);
    
    const content = [
        {
            "title": "Spotlighted Appearance",
            "text": [
                "S1 and S2 proves that the Spotlight effect exists in terms of self-appearance perception.",
                "People tend to overestimate how much impression their appearance leaves on others, positive or negative.",
            ]
        },
        {
            "title": "Spotlighted Behavior",
            "text": [
                "S3 proves that the Spotlight effect exists in terms of self-behavior perception.",
                "People think their behaviors are more noticeable than others, and thus more likely to be recognized by others.",
            ]
        },
        {
            "title": "Anchoring and Adjustment",
            "text": [
                "S4 and S5 explains the likely cause of the Spotlight effect, which is the undercompensation of the anchoring-and-adjustment process.",
                "People are aware of the Spotlight effect, and tries to adjust, but fails to overcome it.",
            ]
        },
        {
            "title": "Young Regrets",
            "text": [
                "The Spotlight effect tends to be seen in young people, who are more concerned about others' perception on themselves.",
                // "This affects people later in life, who regrets not taking action, due to this fear.",
            ]
        },
        {
            "title": "Other Phenomena",
            "text": [
                "Bad hair day.",
                "Illusion of transparency.",
                "Fear of failure.",
                "The Spotlight effect is deeply associated with insecurities."
            ]
        },
    ];

    const contentWidth = 800;
    const contentSeparation = 600;
    const layoutRefs = createRefArray<Layout>();
    for (let i = 0; i < content.length; i++) {
        let sectionTitleRef = createRef<Txt>();
        stage().add(
            <Layout
                ref={layoutRefs}
                layout={true}
                direction={'column'}
                gap={48}
                maxWidth={contentWidth}
                x={(i) * (contentWidth/2 + contentSeparation)}
                y={() => -300 + layoutRefs[i].height()/2}
                alignItems={'center'}
                scale={0.8}
            >
                <Txt
                    ref={sectionTitleRef}
                    text={content[i].title}
                    fontFamily={font}
                    fontSize={50}
                    fill={controlColor}
                    textWrap={true}
                    textAlign={'center'}
                />
            </Layout>
        );

        for (let j = 0; j < content[i].text.length; j++) {
            layoutRefs[i].add(
                <Txt
                    text={content[i].text[j]}
                    fontFamily={font}
                    fontSize={40}
                    fill={'white'}
                    textWrap={true}
                    textAlign={'center'}
                />
            );
        }
    }
    
    layoutRefs[0].opacity(0);
    layoutRefs[1].opacity(0);
    const selector = createRef<Circle>();
    const lineRef = createRef<Line>();
    stage().add(
        <Circle
            ref={selector}
            fill={'white'}
            size={50}
            y={400}
            opacity={0}
        />
    );
    stage().add(
        <Line
            ref={lineRef}
            stroke={'#c1c1c1'}
            lineWidth={10}
            points={[[0, 400], [layoutRefs[layoutRefs.length-1].x(), 400]]}
            zIndex={-1}
            lineCap={'round'}
            opacity={0}
        />
    );
    // yield* beginSlide('show content');
    yield* all(
        layoutRefs[0].scale(1, 1, easeInOutCubic),
        layoutRefs[0].opacity(1, 1, easeInOutCubic),
        layoutRefs[1].opacity(1, 1, easeInOutCubic),
        selector().opacity(1, 1, easeInOutCubic),
        lineRef().opacity(1, 1, easeInOutCubic),
    );

    function* selectContent(i: number) {
        yield* all(
            cameraRef().x(layoutRefs[i].x(), 1, easeInOutCubic),
            selector().x(layoutRefs[i].x(), 1, easeInOutCubic),
            chain(
                all(
                    selector().scale(0.8, 0.5, easeOutCubic),
                    selector().fill('#c1c1c1', 0.5, easeInOutCubic)
                ),
                all(
                    selector().scale(1, 0.5, easeInCubic),
                    selector().fill('#ffffff', 0.5, easeInOutCubic)
                ),
            ),
            layoutRefs[i-1].scale(0.8, 1, easeInOutCubic),
            layoutRefs[i].scale(1, 1, easeInOutCubic),
        );
    }
    yield* beginSlide('show content 1');
    yield* selectContent(1);
    yield* beginSlide('show content 2');
    yield* selectContent(2);
    yield* beginSlide('show content 3');
    yield* selectContent(3);
    yield* beginSlide('show content 4');
    yield* selectContent(4);

    yield* beginSlide('end');
    yield* all(
        cameraRef().centerOn(selector(), 1, easeInOutCubic),
        cameraRef().zoom(20, 1, easeInOutCubic),
        selector().size(400, 1, easeInOutCubic),
    );
    view.removeChildren();
    view.add(<Node ref={stage}/>);
    view.add(
        <Camera.Stage
            cameraRef={cameraRef}
            scene={stage()}
            size={view.size()}
        />
    );

    const you = createRef<Circle>();
    stage().add(
        <Circle
            ref={you}
            fill={'white'}
            size={2000}
        />
    );

    yield* all(
        you().size(70, 1, easeInOutCubic),
        you().fill(observersColor, 1, easeInOutCubic),
    );

    const eyesPerLayer = 5;
    const layers = 2;
    const stepDistance = 100;
    const eyeSize = 50;
    const eyes = createRefArray<Circle>();
    const pupils = createRefArray<Circle>();
    const layersRefs = createRefArray<Node>();

    for (let i = 0; i < layers; i++) {
        stage().add(
            <Node
                ref={layersRefs}
                opacity={0}
            />
        )
        const layerEyes = eyesPerLayer * (i+1);
        for (let j = 0; j < layerEyes; j++) {
            const eyeDistance = stepDistance * (i+1);
            layersRefs[i].add(
                <Circle
                    ref={eyes}
                    position={[
                        eyeDistance * Math.cos(2 * Math.PI / layerEyes * j),
                        eyeDistance * Math.sin(2 * Math.PI / layerEyes * j),
                    ]}
                    size={eyeSize}
                    fill={'white'}
                >
                    <Circle
                        ref={pupils}
                        size={eyeSize/2}
                        fill={'black'}
                    />
                </Circle>
            );
        }
    }
    function* rotateLoop(i: number) {
        var direction = i % 2 == 0 ? 1 : -1;
        yield* layersRefs[i].rotation(layersRefs[i].rotation() + direction*(layers-i)*3, 1, linear);
    }
    function* colorLoop() {
        const randomColor = '#' + Math.floor(Math.random()*16777216).toString(16).padStart(6, '0');
        yield* you().fill(randomColor, 1, easeInOutSine);
    }
    for (let i = 0; i < layers; i++) {
        yield loop(() => rotateLoop(i));
    }
    yield loop(() => colorLoop());
    yield* chain(
        ...layersRefs.map((layer) => {
            return layer.opacity(1, 1, easeInOutCubic);
        })
    );

    const texts = [
        "Thanks for the Spotlight!",
        "Jonas (Hien)",
        "Tu",
        "Phung",
        "Jonas (Quan)",
        "Huy",
    ];
    const textRefs = createRefArray<Txt>();
    for (let i = 0; i < texts.length; i++) {
        stage().add(
            <Txt
                ref={textRefs}
                text={texts[i]}
                fontSize={30}
                fill={'#fff'}
                fontFamily={font}
                opacity={0}
            />
        );
    }
    textRefs[0].fill(otherColor);
    const orbitTime = createSignal(0);
    const orbitRadius = 500;
    for (let i = 0; i < texts.length; i++) {
        textRefs[i].position(() => [
            orbitRadius * Math.cos(2 * Math.PI * i/texts.length + orbitTime()),
            orbitRadius * Math.sin(2 * Math.PI * i/texts.length + orbitTime()),
        ]);
    }
    yield loop(() => orbitTime(orbitTime() + 0.01));

    yield* sequence(
        0.3,
        ...textRefs.map((text, i) => {
            return text.opacity(1, 1, easeInOutCubic);
        })
    );

    yield* beginSlide('close');
    waitFor(1);
});