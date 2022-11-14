module.exports.setState = function setState(newState, when = () => true, order = 0) {
  return {
    show: false,
    when,
    name: 'stateUpdate',
    title: 'Update State',
    order,
    run(answers, _, utils, state) {
      if (typeof newState === 'function') {
        newState(state, answers);
      } else {
        for (const key of Object.keys(newState)) {
          state[key] = newState[key];
        }
      }
    }
  };
};
