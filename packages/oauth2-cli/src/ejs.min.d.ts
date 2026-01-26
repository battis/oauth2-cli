declare type MinimalEJS = {
  renderFile: <T>(path: string, data?: Record<string, unknown>) => T;
};
