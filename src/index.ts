import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { Message } from '@lumino/messaging';

import { Widget } from '@lumino/widgets';

interface SCResponse {
  preview: string;
  artist: any;
  name: string;
  title: string;
  link: string;
}

class SCWidget extends Widget {
  /**
   * Construct a new SC widget.
   */
  constructor() {
    super();

    this.addClass('my-SCWidget');

    // Add a summary element to the panel
    this.summary = document.createElement('p');
    this.node.appendChild(this.summary);

    // Add a visualization canvas to the panel
    this.canvas = document.createElement('canvas');
    this.node.appendChild(this.canvas);

    // Add a audio player element to the panel
    this.audio = document.createElement('audio');
    this.node.appendChild(this.audio);
  }

  /**
   * The iframe element associated with the widget.
   */

  readonly div: HTMLDivElement;

  /**
   * The image element associated with the widget.
   */
  readonly img: HTMLImageElement;

  /**
   * The summary text element associated with the widget.
   */
  readonly summary: HTMLParagraphElement;

  /**
   * The audio player
   */
  readonly audio: HTMLAudioElement;

  /**
   * The audio player
   */
  readonly canvas: HTMLCanvasElement;

  /**
   * Handle update requests for the widget.
   */
  async onUpdateRequest(msg: Message): Promise<void> {
    //3135556
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://api.deezer.com/track/${this.randomID()}`
    );

    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        this.summary.innerText = data.error.message;
      } else {
        this.summary.innerText = response.statusText;
      }
      return;
    }

    const data = (await response.json()) as SCResponse;

    this.summary.id = 'summary';
    this.summary.innerHTML = `
    <div id="content">
    <div id="info"><span class="title"><a href="${data.link}">${
      data.title
    }</a></span> by <span class="artist"><a href=${data.artist.link}>${
      data.artist.name
    }</a></span>
    </div>
      <canvas id="canvas"></canvas>
    </div>
    `;

    this.audio.controls = true;
    this.audio.id = 'audio';
    this.audio.crossOrigin = 'anonymous';
    this.audio.src = data.preview;
    this.audio.load();

    this.canvas.id = 'canvas';

    //https://codepen.io/nfj525/pen/rVBaab
    //create audio context for fft analysis

    var context = new AudioContext();
    var src = context.createMediaElementSource(this.audio);
    var analyser = context.createAnalyser();

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    var ctx = this.canvas.getContext('2d');

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = this.canvas.width;
    var HEIGHT = this.canvas.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        var b = barHeight + 25 * (i / bufferLength);
        var g = 250 * (i / bufferLength);
        var r = 50;

        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }
    this.audio.load();

    renderFrame();

  /**
   * Get a random id in the range of deezer track ids
   */
  randomID(): string {
    const randomID = Math.round(Math.random() * 999999 + 100000);
    console.log('finding random song');
    console.log(randomID);
    return randomID.toString();
  }
}

function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer
) {
  console.log('JupyterLab extension jupyterlab_apod is activated!');

  // Declare a widget variable
  let widget: MainAreaWidget<SCWidget>;

  // Add an application command
  const command: string = 'sc:open';
  app.commands.addCommand(command, {
    label: 'Random Song Frequency Spectrum',
    execute: () => {
      if (!widget) {
        // Create a new widget if one does not exist
        const content = new SCWidget();
        widget = new MainAreaWidget({ content });
        widget.id = 'sc-jupyterlab';
        widget.title.label = 'Random Song Frequency Spectrum';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        // Track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main');
      }
      widget.content.update();

      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // Add the command to the palette.
  palette.addItem({ command, category: 'Tutorial' });

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<SCWidget>>({
    namespace: 'apod'
  });
  restorer.restore(tracker, {
    command,
    name: () => 'apod'
  });
}

/**
 * Initialization data for the jupyterlab_soundcloud_ext extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_soundcloud',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate
};

export default extension;
