'use strict'
// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
  try {
    if (isTopFrame()) {
      const allFields = [];

      window.addEventListener('message', (event) => {
        if (event.data.type === 'fieldData') {
          // Merge fields from frames
          const fields = event.data.fields;
          allFields.push(...fields);

          if (event.data.isLastFrame) {
            // Sort the fields by name in ascending order
            allFields.sort((a, b) => a.name.localeCompare(b.name));

            // Send event with all fields to top frame
            const eventData = { fields: allFields };
            const event = new CustomEvent('frames:loaded', { detail: eventData });
            window.dispatchEvent(event);
          }
        }
      });

      // Trigger event to start collecting fields from child frames
      const message = { type: 'collectFields' };
      window.postMessage(message, '*');
    } else if (!isTopFrame()) {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'collectFields') {
          // Extract fields from current frame
          const frameFields = Array.from(document.querySelectorAll('input, select, textarea'));
          const fields = frameFields.map((field) => {
            const name = field.getAttribute('name');
            const label = findLabelForField(field);
            return { name, label };
          });

          // Send fields data to top frame
          const message = { type: 'fieldData', fields, isLastFrame: true };
          window.parent.postMessage(message, '*');
        }
      });

      // Trigger event to start collecting fields in the current frame
      const message = { type: 'collectFields' };
      window.postMessage(message, '*');
    }
  } catch (e) {
    console.error(e);
  }
}

function findLabelForField(field) {
  const labels = field.labels;
  if (labels.length > 0) {
    return labels[0].innerText;
  }

  let parentElement = field.parentElement;
  while (parentElement) {
    if (parentElement.tagName === 'LABEL') {
      return parentElement.innerText;
    }
    parentElement = parentElement.parentElement;
  }

  return '';
}

execute();
