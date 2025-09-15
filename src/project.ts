import {makeProject} from '@motion-canvas/core';

// import test from './scenes/test?scene';
import introduction from './scenes/introduction?scene';
import study1 from './scenes/study1?scene';
import study2 from './scenes/study2?scene';
import study3 from './scenes/study3?scene';
import study4 from './scenes/study4?scene';
import study5 from './scenes/study5?scene';
import critical from './scenes/critical?scene';
import conclusion from './scenes/conclusion?scene';

export default makeProject({
  scenes: [
    introduction,
    study1,
    study2,
    study3,
    study4,
    study5,
    critical,
    conclusion
  ],
});
