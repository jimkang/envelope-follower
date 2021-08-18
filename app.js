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
  var { getCurrentContext } = ContextKeeper({ offline: true });
  var { error, values } = await ep(getCurrentContext, {
    sampleRate: infoBuffer.sampleRate,
    length: infoBuffer.length,
    numberOfChannels: infoBuffer.numberOfChannels,
  });
  if (error) {
    handleError(error);
    return;
  }

  var ctx = values[0];

  try {
    //await ctx.resume();
    await ctx.audioWorklet.addModule('modules/envelope-follower.js');
  } catch (error) {
    handleError(error);
    return;
  }

  var infoBufferNode = ctx.createBufferSource();
  infoBufferNode.buffer = infoBuffer;
  var envelopeFollowerNode = new AudioWorkletNode(
    ctx,
    'envelope-follower-processor',
    { processorOptions: { smoothingFactor: 0.2 } }
  );

  ctx.destination.channelCount = infoBuffer.numberOfChannels;

  infoBufferNode.connect(envelopeFollowerNode);
  envelopeFollowerNode.connect(ctx.destination);
  infoBufferNode.start();
  ctx.startRendering().then(onRecordingEnd).catch(handleError);

  function onRecordingEnd(renderedBuffer) {
    renderResultAudio({
      audioBuffer: renderedBuffer,
      containerSelector: '.result-audio',
    });
  }
}

function reportTopLevelError(msg, url, lineNo, columnNo, error) {
  handleError(error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
