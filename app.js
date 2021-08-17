import RouteState from 'route-state';
import handleError from 'handle-error-web';
import { version } from './package.json';
import { renderSources } from './renderers/render-sources';
import { renderResultAudio } from './renderers/render-result-audio';
import { decodeArrayBuffer } from './tasks/decode-array-buffer';
import { queue } from 'd3-queue';
import ContextKeeper from 'audio-context-singleton';
import ep from 'errorback-promise';

var routeState;
var infoBuffer;

var envelopeButton = document.getElementById('envelope-button');
envelopeButton.addEventListener('click', startTransformation);

(async function go() {
  window.onerror = reportTopLevelError;
  renderVersion();

  routeState = RouteState({
    followRoute,
    windowObject: window,
  });
  routeState.routeFromHash();
})();

function followRoute() {
  renderSources({ onBuffers });

  function onBuffers(buffers) {
    if (buffers.length < 1) {
      return;
    }

    var q = queue();
    buffers.forEach((buffer) => q.defer(decodeArrayBuffer, buffer));
    q.awaitAll(useAudioBuffers);
  }

  function useAudioBuffers(error, audioBuffers) {
    if (error) {
      handleError(error);
      return;
    }

    infoBuffer = audioBuffers[0];

    renderResultAudio({
      audioBuffer: infoBuffer,
      containerSelector: '.file1-audio',
    });
    envelopeButton.classList.remove('hidden');
  }
}

async function startTransformation() {
  var { getCurrentContext } = ContextKeeper();
  var { error, values } = await ep(getCurrentContext);
  if (error) {
    handleError(error);
    return;
  }

  var ctx = values[0];

  try {
    await ctx.resume();
    await ctx.audioWorklet.addModule('modules/envelope-follower.js');
  } catch (error) {
    handleError(error);
    return;
  }

  var inBufferNode = ctx.createBufferSource();
  inBufferNode.buffer = infoBuffer;
  var envelopeFollowerNode = new AudioWorkletNode(
    ctx,
    'envelope-follower-processor',
    { processorOptions: { smoothingFactor: 0.2 } }
  );

  var { startRecording, stopRecording, recordingDest } = getRecordingDest({
    ctx,
    channelCount: infoBuffer.numberOfChannels,
    onRecordingEnd,
  });

  ctx.destination.channelCount = infoBuffer.numberOfChannels;

  inBufferNode.connect(envelopeFollowerNode);
  envelopeFollowerNode.connect(ctx.destination);
  envelopeFollowerNode.connect(recordingDest);

  startRecording();

  inBufferNode.addEventListener('ended', stopRecording);
  inBufferNode.start(0);

  function onRecordingEnd({ chunks }) {
    if (chunks.length !== 1) {
      handleError(
        new Error(
          'Did not expect anything other than one chunk from media recorder.'
        )
      );
      return;
    }

    renderResultAudio({
      blob: chunks[0],
      containerSelector: '.result-audio',
    });
  }
}

function getRecordingDest({ ctx, channelCount, onRecordingEnd }) {
  var chunks = [];
  var recordingDest = ctx.createMediaStreamDestination();
  recordingDest.channelCount = channelCount;
  var recorder = new MediaRecorder(recordingDest.stream);
  recorder.ondataavailable = saveData;
  recorder.onstop = onStop;

  return { startRecording, stopRecording, recordingDest };

  function saveData(e) {
    chunks.push(e.data);
  }

  function onStop() {
    onRecordingEnd({ chunks });
  }

  function startRecording() {
    recorder.start();
  }

  function stopRecording() {
    recorder.stop();
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
