/**
 * This project is a jupyter lab/notebook complexity calculator
 */

// https://stackoverflow.com/questions/69657393/how-to-use-events-in-jupyterlab-extensions/69658573#69658573
// https://discourse.jupyter.org/t/how-to-get-output-model-for-a-given-cell-in-a-jupyterlab-extension/11342
// https://blog.ouseful.info/2022/04/28/jupyterlab-cell-status-indicator/

// Default Imports

import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application'

// Imports to get Notebook contents, such as cell data etc ...
import {
  Notebook,
  INotebookTracker,
  NotebookActions
} from '@jupyterlab/notebook';

/**
 * Initialization data for the icomplexity extension.
 */

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'ihighlight:plugin',
  description: 'A jupyter lab/notebook front-end extensionsion for highlighting cells based on execution status',
  autoStart: true,
  requires: [INotebookTracker],
  activate: async (app: JupyterFrontEnd, tracker: INotebookTracker, notebook: Notebook,) => {

    console.log('ihighlight is activated!');
    
    // Detect current Jupyter Lab Theme ... ???

    // icomplexity cell status tracker
    NotebookActions.executionScheduled.connect((_, args) => {

      const { cell } = args; // cell passed as argument to the executionScheduled event handler/listener

      // If cell is a code cell set the status CSS class to "scheduled" and remove other classes
      if (cell.model.type === 'code') {

        let editor_widget = cell.editorWidget;

        // Remove CSS classes

        // Remove promptNode styling
        cell.inputArea?.promptNode.classList.remove("prompt-node-success");
        cell.inputArea?.promptNode.classList.remove("prompt-node-error");
        
        // Remove editorWidget styling
        editor_widget?.removeClass('editor-success');
        editor_widget?.removeClass('editor-error');

        if (cell.model.sharedModel.source !== "") { // check if cell contains code

          // Add styling for prompt node (code cell tag/number)
          let prompt_node = cell.inputArea?.promptNode;
          prompt_node?.classList.add("prompt-node-scheduled");

          // Add styling for editor widget (code cell body/block)
          
          editor_widget?.addClass('editor-scheduled');

        }

      }

    })

    NotebookActions.executed.connect((_, args) => {
      
      // The following construction seems to say something akin to: const cell = args["cell"]
      const { cell } = args;
      const { success } = args;

      // If we have a code cell, update the status
      if (cell.model.type == 'code') {
        
        let editor_widget = cell.editorWidget;

        // Remove CSS classes

        // Remove promptNode styling
        cell.inputArea?.promptNode.classList.remove("prompt-node-error");
        cell.inputArea?.promptNode.classList.remove("prompt-node-success");
        cell.inputArea?.promptNode.classList.remove("prompt-node-scheduled");        

        // Remove editorWidget styling            
        editor_widget?.removeClass('editor-error');
        editor_widget?.removeClass('editor-scheduled');
        editor_widget?.removeClass('editor-success');

        if (success) {

          // check if cell contains code
          // an empty code block will always execute successfully
          if (cell.model.sharedModel.source !== "") {

            // Add new CSS classes
            
            // Add styling for promptNode success
            cell.inputArea?.promptNode.classList.add("prompt-node-success");

            // Add styling for editor widget (code cell body/block)
            editor_widget?.addClass('editor-success');

            // Proceed to calculate algorithmic complexity of code cell

          }

        } else {

          // Add new CSS classes

          // Add styling for promptNode error
          cell.inputArea?.promptNode.classList.add("prompt-node-error");

          // Add styling for editor widget (code cell body/block)
          editor_widget?.addClass('editor-error');

        }

      }
      
    })

  }

}

export default plugin;