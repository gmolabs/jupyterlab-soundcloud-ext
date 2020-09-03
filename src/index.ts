import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab_soundcloud_ext extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-soundcloud-ext',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-soundcloud-ext is activated!');
  }
};

export default extension;
