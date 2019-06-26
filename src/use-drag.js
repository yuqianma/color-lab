const { useCallback } = preactHooks;

const coverDom = document.createElement('div');
coverDom.style.cssText = `
width: 100%;
height: 100%;
top: 0;
position: fixed;
`;

function cover() {
  document.body.appendChild(coverDom);
}
function uncover() {
  document.body.removeChild(coverDom);
}

export const useDrag = ({ startPosition, drag, end }, args) => {
  let target = null;
  let isMoved = false;
  let start = {};

  const ondrag = useCallback((event) => {
    if (!target) { return; }

    if (!isMoved) {
      isMoved = true;
      cover();
    }

    drag({
      target,
      x: event.clientX - start.x,
      y: event.clientY - start.y,
      event,
    });
  }, args);

  const onmouseup = useCallback(() => {
    target = null;
    isMoved = false;
    start = {};
    uncover();
    document.body.removeEventListener('mousemove', ondrag);
    document.body.removeEventListener('mouseup', onmouseup);
    end && end();
  }, [ondrag]);

  const onmousedown = useCallback((e) => {
    target = e.target;
    const { x, y } = startPosition(e);
    start = {
      x: e.clientX - x,
      y: e.clientY - y
    };
    document.body.addEventListener('mousemove', ondrag);
    document.body.addEventListener('mouseup', onmouseup);
  }, [ondrag]);

  return {
    onmousedown,
    // onmouseup,
  }
};
