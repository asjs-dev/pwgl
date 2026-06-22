const getPointerSource = (event) =>
  (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || event;

export const getCanvasPointerPosition = (canvas, event) => {
  const pointer = getPointerSource(event);
  const rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
  const width = rect && rect.width ? rect.width : canvas.offsetWidth;
  const height = rect && rect.height ? rect.height : canvas.offsetHeight;
  const left = rect ? rect.left : 0;
  const top = rect ? rect.top : 0;

  return {
    x: (canvas.width / width) * (pointer.clientX - left),
    y: (canvas.height / height) * (pointer.clientY - top),
  };
};
