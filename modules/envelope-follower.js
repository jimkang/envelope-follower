class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
  constructor({ processorOptions }) {
    super();
    this.smoothingFactor = processorOptions.smoothingFactor;
    this.prevAvg;
  }

  process(inputList, outputList) {
    /* using the inputs (or not, as needed), write the output
       into each of the outputs */
    if (inputList.length < 1 && outputList.length < 1) {
      return false;
    }

    const input = inputList[0];
    const output = outputList[0];

    let channelCount = Math.min(input.length, output.length);

    for (let channelNum = 0; channelNum < channelCount; channelNum++) {
      let samples = input[channelNum];
      const sampleCount = samples.length;
      for (let i = 0; i < sampleCount; i++) {
        // Math.abs is the rectifying.
        const sample = Math.abs(samples[i]);
        if (this.prevAvg === undefined) {
          this.prevAvg = sample;
          continue;
        }
        const avg = calcNextAvg(this.prevAvg, this.smoothingFactor, sample);
        output[channelNum][i] = avg;
        this.prevAvg = avg;
      }
    }

    return true;
  }
}

function calcNextAvg(prevAvg, smoothingFactor, currentValue) {
  const inverseSmoothingFactor = 1.0 - smoothingFactor;
  return smoothingFactor * currentValue + inverseSmoothingFactor * prevAvg;
}

registerProcessor('envelope-follower-processor', EnvelopeFollowerProcessor);
