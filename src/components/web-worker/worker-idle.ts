self.onmessage = function (e) {
  const { interval } = e.data;
  setInterval(() => {
    postMessage(0.01);
  }, interval);
};
