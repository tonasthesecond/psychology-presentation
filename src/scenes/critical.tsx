import { Camera, makeScene2D, Txt, Node, Circle, Img, Rect, QuadBezier, Layout } from "@motion-canvas/2d";
import { all, any, beginSlide, cancel, chain, createRef, createRefArray, createSignal, easeInBack, easeInCubic, easeInOutCirc, easeInOutCubic, easeInOutQuad, easeInOutSine, easeOutBack, easeOutBounce, easeOutCubic, easeOutElastic, linear, loop, PossibleVector2, Reference, sequence, useRandom, Vector2, waitFor } from "@motion-canvas/core";
import img1 from '../../assets/barry manilow.jpg';
import img2 from '../../assets/jerry seinfield.jpg';
import img3 from '../../assets/martin.jpg';
import img4 from '../../assets/vanilla ice.jpg';
import img5 from '../../assets/phung.jpg';

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
                text="Critical Evaluation"
                fontFamily={font}
                fontSize={100}
                fill="white"
                opacity={0}
            />,
            <Txt
                ref={subtitle}
                text="owo"
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
    yield* beginSlide('sample size');
    yield* all(
        subtitle().opacity(0, 1, easeInOutCubic),
        titleRef().scale(0.75, 1, easeInOutCubic),
        titleRef().y(-view.height()/2 + titleRef().height(), 1, easeInOutCubic),
        titleRef().text('1. Sample Size', 1, easeInOutCubic),
    );
    subtitle().remove();
    const layoutRef = createRef<Layout>();
    const fontSize = 40;
    const yOffset = 50;
    stage().add(
        <Layout
            ref={layoutRef}
            layout={true}
            direction={'column'}
            gap={fontSize}
            width={view.width() * 0.75}
            maxWidth={view.width() * 0.75}
            alignItems={'center'}
            y={yOffset}
        />
    );
    const textRefs = createRefArray<Txt>();
    let content = [
        "Researchers noted that there were instances without sufficient participants, even with preventive measures applied.",
        "- S2 has different results to S1 due to range restrictions.",
        "- Confederates had to be employed for S4 and S5 because it was \"easier to schedule\".",
    ];
    let contentCount = content.length;
    for (let i = 0; i < contentCount; i++) {
        layoutRef().add(
            <Txt
                ref={textRefs}
                fontFamily={font}
                fontSize={fontSize}
                fill={'white'}
                textWrap={true}
                text=''
                minWidth={view.width() * 0.75}
            />
        );
    }
    textRefs[0].fill(controlColor);
    yield* chain(
        ...textRefs.map((ref, i) => {
            return ref.text(content[i], 1, easeInOutCubic);
        }),
    );
    yield* beginSlide('subjectivity');
    yield* titleRef().text('2. Subjectivity', 0.5, easeInOutCubic);
    let lastChosenImg = -1;
    const imgs = [img1, img2, img3, img4, img5];
    const imgRef = createRef<Img>();
    function* peekingLoop() {
        var randomIndex = random.nextInt(0, imgs.length);
        while (randomIndex === lastChosenImg) {
            randomIndex = random.nextInt(0, imgs.length);
        }
        lastChosenImg = randomIndex;
        const randomImg = imgs[randomIndex];
        const randomSide = [-1, 1][random.nextInt(0, 2)];
        stage().add(
            <Img
                ref={imgRef}
                src={randomImg}
                position={() => [
                    randomSide * (view.width() / 2 + imgRef().width()/2),
                    random.nextInt(-view.height() / 2, view.height() / 2),
                ]}
                scale={0.3}
            />
        );
        imgRef().save();
        yield* all(
            imgRef().rotation(-randomSide * random.nextInt(45, 80), 0.5, easeOutCubic),
            imgRef().x(imgRef().x() - randomSide * imgRef().width()/2, 0.5, easeOutCubic),
        );
        yield* imgRef().restore(0.5, easeInCubic);
    }
    const peekingTask = yield loop(() => peekingLoop());
    content = [
        "There was some subjective decisions made by the researchers.",
        "- No clear criteria on what constitutes \"embarassing\" images.",
        "- S4 used a different shirt than the other \"embarassing\" studies.",
    ];
    let extraContentCount = content.length - contentCount;
    for (let i = 0; i < extraContentCount; i++) {
        layoutRef().add(
            <Txt
                ref={textRefs}
                fontFamily={font}
                fontSize={fontSize}
                fill={'white'}
                textWrap={true}
                text=''
                minWidth={view.width() * 0.75}
            />
        );
    }
    contentCount = content.length;
    yield* chain(
        ...textRefs.map((ref, i) => {
            return ref.text(content[i], 0.5, easeInOutCubic);
        }),
    );
    yield* beginSlide('sample bias');
    cancel(peekingTask);
    imgRef().remove();
    yield* titleRef().text('3. Sample Bias', 0.5, easeInOutCubic);
    content = [
        "The tested sample may not be representative.",
        "- Only university students were included, which is a very specific social group.",
        "- The Spotlight effect seems to be more prevalent for younger people.",
        "- S3's activity specifically does not represent \"typical behavior\"."
    ];
    extraContentCount = content.length - contentCount;
    for (let i = 0; i < extraContentCount; i++) {
        layoutRef().add(
            <Txt
                ref={textRefs}
                fontFamily={font}
                fontSize={fontSize}
                fill={'white'}
                textWrap={true}
                text=''
                minWidth={view.width() * 0.75}
            />
        );
    }
    contentCount = content.length;
    yield* chain(
        ...textRefs.map((ref, i) => {
            return ref.text(content[i], 0.5, easeInOutCubic);
        }),
    );

    yield* beginSlide('end');
    yield* all(
        titleRef().text('', 1, easeInOutCubic),
        ...textRefs.map((ref, i) => {
            return ref.text('', 1, easeInOutCubic);
        })
    );
    view.removeChildren();
});