const { useCallback } = preactHooks;
export const useDrag = (dragHandler, args) => {
  let target = null;
  const ondrag = useCallback((e) => {
    target && dragHandler(Object.assign(e, { draggingTarget: target }));
  }, args);

  const onmouseup = useCallback(() => {
    target = null;
    document.body.removeEventListener('mousemove', ondrag);
    document.body.removeEventListener('mouseup', onmouseup);
  }, [ondrag]);

  const onmousedown = useCallback((e) => {
    target = e.target;
    document.body.addEventListener('mousemove', ondrag);
    document.body.addEventListener('mouseup', onmouseup);
  }, [ondrag]);

  return {
    onmousedown,
    // onmouseup,
  }
};
