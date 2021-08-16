class EnvelopeFollowerProcessor extends AudioWorkletProcessor {
  constructor({ processorOptions }) {
    super();
    this.windowsPerBlock = processorOptions.windowsPerBlock;
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
      const windowLength = sampleCount / this.windowsPerBlock;
      for (let i = 0; i < sampleCount; i++) {
        output[channelNum][i] = getRectifiedAvgOfNeighbors(
          samples,
          windowLength,
          i
        );
      }
    }

    return true;
  }
}

function getRectifiedAvgOfNeighbors(array, windowLength, i) {
  var lowerBound = ~~(i - windowLength / 2);
  if (lowerBound < 0) {
    lowerBound = 0;
  }
  var upperBound = ~~(i + windowLength / 2);
  if (upperBound > array.length) {
    upperBound = array.length;
  }

  const size = upperBound - lowerBound;
  if (size < 1) {
    return 0;
  }

  var sum = 0;
  for (let j = lowerBound; j < upperBound; ++j) {
    // Math.abs is the rectifying.
    sum += Math.abs(array[j]);
  }
  return sum / size;
}

registerProcessor('envelope-follower-processor', EnvelopeFollowerProcessor);
