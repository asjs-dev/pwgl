const logStateKey = Symbol.for("PWGLExtensions.logExtensions.state");

export const getExtensionsRoot = () => {
  const root = window.PWGLExtensions || window.AGLExtensions || {};

  root.version ??= "{{appVersion}}";
  window.PWGLExtensions = root;
  window.AGLExtensions = root;

  return root;
};

export const registerExtensions = (groupName, extensions) => {
  const root = getExtensionsRoot();

  root[groupName] = {
    ...root[groupName],
    ...extensions,
  };

  return root;
};

export const logExtensions = () => {
  const root = getExtensionsRoot();

  if (root[logStateKey]) {
    return;
  }

  root[logStateKey] = true;

  console.log(
    `%cPWGL Extensions v${root.version}\nhttps:\/\/github.com/asjs-dev/pwgl`,
    "background:#222;color:#0F0",
  );
};
