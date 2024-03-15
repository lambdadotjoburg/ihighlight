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

// Additional Imports

// Import for adding Lumino Widgets to the Notebook Panel
import {
  Widget
} from '@lumino/widgets'

// Import to add unique ID's to DOM Elements
import {
  DOMUtils
} from '@jupyterlab/apputils'

// Imports to get Notebook contents, such as cell data etc ...
import {
  Notebook,
  INotebookTracker,
  NotebookActions
} from '@jupyterlab/notebook';

/**
 * Initialization data for the icomplexity extension.
 */

// CSS class name for top area panel anchor/image widget
const ilambda_Anchor_CSS_CLASS = "jp-ilambda-Anchor";

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'icomplexity:plugin',
  description: 'An analytic complexity calculator jupyter lab/nb extension',
  autoStart: true,
  requires: [],
  activate: async (app: JupyterFrontEnd, tracker: INotebookTracker, notebook: Notebook,) => {

    let node;

    // Check if the node exists before creating it
    if (!document.querySelector(".jp-ilambda-Anchor")) {
      // If the node doesn't exist, create it
      node = document.createElement("div");
      node.innerHTML = "<a href='https://www.lambda.joburg' target='_blank'><img src='https://lambda.joburg/assets/images/index/logo/lambda_logo.svg'></a>";
    }

    // Check if the node has been successfully created
    if (node) {
      const widget = new Widget({node}); // constructor for creating a widget from a DOM element
      widget.addClass(ilambda_Anchor_CSS_CLASS);
      widget.id = DOMUtils.createDomID();
      app.shell.add(widget, 'top', {rank: 1000}); // rank - move widget to right-most position in top area panel
    }
    
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