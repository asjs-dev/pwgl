export const expectCloseArray = (expect, actual, expected, precision = 6) => {
  expect(Array.from(actual)).toHaveLength(expected.length);

  expected.forEach((value, index) => {
    expect(actual[index]).toBeCloseTo(value, precision);
  });
};
