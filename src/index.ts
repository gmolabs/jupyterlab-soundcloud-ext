import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';

import { Widget } from '@lumino/widgets';

/**
 * Initialization data for the jupyterlab_soundcloud_ext extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_soundcloud',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension jupyterlab_soundcloud is activated!');
    console.log('ICommandPalette:', palette);

    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = 'sc-jupyterlab';
    widget.title.label = 'Soundcloud Frequency Spectrum';
    widget.title.closable = true;

    // Add an application command
    const command: string = 'sc:open';
    app.commands.addCommand(command, {
      label: 'Soundcloud Frequency Spectrum',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });

    // Add the command to the palette.
    palette.addItem({ command, category: 'Tutorial' });
  }
};

export default extension;
