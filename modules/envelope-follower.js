class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputList, outputList) {
    //, parameters) {
    /* using the inputs (or not, as needed), write the output
       into each of the outputs */
    if (inputList.length < 1 && outputList.length < 1) {
      return false;
    }

    const input = inputList[0];
    const output = outputList[0];

    let channelCount = Math.min(input.length, output.length);
    let sampleCount = input.length;

    for (let channelNum = 0; channelNum < channelCount; channelNum++) {
      for (let i = 0; i < sampleCount; i++) {
        let sample = input[channelNum][i];
        output[channelNum][0] = sample;
      }
    }

    return true;
  }
}

registerProcessor('envelope-follower-processor', EnvelopeFollowerProcessor);
