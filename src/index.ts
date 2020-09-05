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
}

class SCWidget extends Widget {
  /**
   * Construct a new SC widget.
   */
  constructor() {
    super();

    this.addClass('my-SCWidget');

    // Add a deezer player widget to the panel
    this.div = document.createElement('div');
    this.node.appendChild(this.div);

    // // Add an image element to the panel
    // this.img = document.createElement('img');
    // this.node.appendChild(this.img);

    // Add a summary element to the panel
    this.summary = document.createElement('p');
    this.node.appendChild(this.summary);
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

    this.summary.innerHTML = `<a href="${data.preview}">${data.title} by ${
      data.artist.name
    }</a>`;
    // if (data.media_type === 'image') {
    //   // Populate the image
    //   this.img.src = data.url;
    //   this.img.title = data.title;
    //   this.summary.innerText = data.title;

    //   this.div.innerHTML = `<iframe scrolling="no" frameborder="0" allowTransparency="true" src="https://www.deezer.com/plugins/player?format=classic&autoplay=false&playlist=true&width=700&height=350&color=007FEB&layout=dark&size=medium&type=tracks&id=${this.randomID()}&app_id=1"></iframe>`;

    //   if (data.copyright) {
    //     this.summary.innerText += ` (Copyright ${data.copyright})`;
    //   }
    // } else {
    //   this.summary.innerText = 'Random APOD fetched was not an image.';
    // }
  }

  /**
   * Get a random date string in YYYY-MM-DD format.
   */
  randomDate(): string {
    const start = new Date(2010, 1, 1);
    const end = new Date();
    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    return randomDate.toISOString().slice(0, 10);
  }

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
    label: 'Soundcloud Frequency Spectrum',
    execute: () => {
      if (!widget) {
        // Create a new widget if one does not exist
        const content = new SCWidget();
        widget = new MainAreaWidget({ content });
        widget.id = 'sc-jupyterlab';
        widget.title.label = 'SC Freq Spectrum';
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
