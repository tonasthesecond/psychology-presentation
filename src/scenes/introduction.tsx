import { Node, Circle, Txt } from '@motion-canvas/2d/lib/components';
import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { beginSlide, createRef, createRefArray, useRandom } from '@motion-canvas/core/lib/utils';
import { all, loop, waitFor  } from '@motion-canvas/core/lib/flow';
import { cos, easeInOutCubic, linear, map } from '@motion-canvas/core/lib/tweening';
import { cancel, createSignal, Random, spawn, Vector2 } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
    view.fill('#191919');
    const font = 'Pixel Code';

    const logo = createRef<Node>();
    const you = createRef<Circle>();
    
    const eyes_number = 7;
    const distanceFromCenter = 300;
    const eyes = createRefArray<Circle>();
    const pupils = createRefArray<Circle>();

    view.add(
        <Node ref={logo}>
            <Circle ref={you} position={[0, 0]} size={200} fill={'#31a6ff'}>
                {/* <Txt text="you" fontFamily={font} fontSize={64} fill="black" /> */}
            </Circle>
        </Node>
    )

    for (let i = 0; i < eyes_number; i++) {
        const eyeDistance = distanceFromCenter;
        
        logo().add(
            <Circle
                ref={eyes}
                position={[
                    eyeDistance * Math.cos(2 * Math.PI / eyes_number * i),
                    eyeDistance * Math.sin(2 * Math.PI / eyes_number * i),
                ]}
                size={150}
                fill={'white'}
                opacity={0}
            >
                <Circle ref={pupils} size={70} fill={'black'} />
            </Circle>
        );
    }

    yield* beginSlide('eyes fade in');
    function* rotationLoop() {
        yield* all(
            logo().rotation(logo().rotation() + 100, 1, linear),
            you().rotation(you().rotation() - 100, 1, linear)
        );
    }
    yield loop(() => rotationLoop());

    yield* all(
        ...eyes.map((eye, i) => {
            return eye.opacity(1, 1, easeInOutCubic);
        })
    )

    yield* beginSlide('move pupils');
    const moveDistance = 35;
    yield* all(
        ...pupils.map((pupil, i) => {
            return pupil.position( 
                [
                    you().x() - moveDistance * Math.cos(2 * Math.PI / eyes_number * i),
                    you().y() - moveDistance * Math.sin(2 * Math.PI / eyes_number * i),
                ],
                1,
                easeInOutCubic
            );
        })
    );
    // yield loop(() => rotationLoop());
    yield* beginSlide('show title');
    yield* all(
        logo().position([-580, 0], 1, easeInOutCubic),
        logo().scale([0.3, 0.3], 1, easeInOutCubic)
    );
    
    const titleRef = createRef<Txt>();
    view.add(
        <Txt
            ref={titleRef}
            text="Study 5"
            fontFamily={font}
            fontSize={100}
            fill="white"
            opacity={0}
            position={[
                logo().x() + 700,
                logo().y()
            ]}
        />
    );

    yield* titleRef().opacity(1, 1);
    yield* all(
        titleRef().text('Spotlight Effect', 1, easeInOutCubic),
        titleRef().fill('#ffeb39ff', 1, easeInOutCubic),
    );

    yield* beginSlide('end');
    yield* all(
        logo().opacity(0, 1, easeInOutCubic),
        titleRef().opacity(0, 1, easeInOutCubic)
    );
    view.removeChildren();
});