export const debounce = <T extends (...args: unknown[]) => void>(
  fnc: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let time: ReturnType<typeof setTimeout> | undefined;

  return function toBeExecuted(...args: Parameters<T>): void {
    const later = () => {
      if (time !== undefined) {
        clearTimeout(time);
      }
      fnc(...args);
    };

    if (time !== undefined) {
      clearTimeout(time);
    }
    time = setTimeout(later, delay);
  };
};
