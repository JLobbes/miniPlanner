// js/globalListeners.js

const globalListeners = {

  click: null,

  input: null,

  // Keypresses
  ctrlE: null,
  ctrlS: null,
  esc: null,
  enter: null,

  defaultEsc() {
    
  }  
}

function addGlobalListeners () {
  
  document.addEventListener('click', (e) => {
    e.preventDefault();

    const handler = globalListeners.click;
    if(typeof handler === 'function') {
      handler(e)
    }
  })

  document.addEventListener('input', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const handler = globalListeners.input;
    if(typeof handler === 'function') {
      handler(e)
    }    
  })

  document.addEventListener('keydown', (e) => {
    
    if (e.ctrlKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      e.stopPropagation();
      
      const handler = globalListeners.ctrlE;
      if (typeof handler === 'function') {
        handler(e);
      }
    }

    if(e.key === 'Enter') {
      // e.preventDefault() is defined in the handles for 'Enter' press.
      // This is because the miniForm allows default action conditionally.

      const handler = globalListeners.enter;
      if (typeof handler === 'function') {
        handler(e);
      }
    }

    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      searchProjectTreeBtn.click();
    }

    if(e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      
      const handler = globalListeners.esc;
      if(typeof handler === 'function') {
        handler(e);
      }
    }
  });
}
