# envelope-follower

An audioWorklet that gets an <a href="http://msp.ucsd.edu/techniques/latest/book-html/node153.html">envelope follower</a> for a signal. [Here is a demo.](https://jimkang.com/envelope-follower).

## Installing

    npm i envelope-follower

Then, it will be in `modules/envelope-follower` in your project.

You can use it in your web page like so:

    audioContext.audioWorklet.addModule('modules/envelope-follower.js')
    .then(useWorklet)
    .catch(handleError);

    function useWorklet() {
      var envelopeFollowerNode = new AudioWorkletNode(
        audioContext,
        'envelope-follower-processor',
        { processorOptions: { smoothingFactorUp: 0.5, smoothingFactorDown: 0.99 } }
      );
      // Connect a source and dest to it here.
    }

A higher smoothingFactor makes the follower less sensitive to changes in the signal, either when it's rising or falling.

## Getting the demo running

Once you have this source code on your computer, you can get it running by doing the following.

- Install [Node 10 or later](https://nodejs.org/).
- From the root directory of the project (the same one this README file is in), run this command: `npm i`
- Then, run `make run`. It should then say something like `Your application is ready~! Local: http://0.0.0.0:7000`
  - On Windows, you may not have `make`. In that case, you can run `npm run dev`.
  - Go to `http://0.0.0.0:7000` (or `http://localhost:7000`) in your browser. The web app will be running there.
