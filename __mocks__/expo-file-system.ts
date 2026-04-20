export const File = jest.fn().mockImplementation(() => {
  return {
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  };
});
