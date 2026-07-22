const logStateKey = Symbol.for("PWGLExtensions.logExtensions.state");

type ExtensionsRoot = Record<PropertyKey, unknown> & {
  version?: string;
};

declare global {
  interface Window {
    AGLExtensions?: ExtensionsRoot;
    PWGLExtensions?: ExtensionsRoot;
  }
}

export const getExtensionsRoot = (): ExtensionsRoot => {
  const root = window.PWGLExtensions || window.AGLExtensions || {};

  if (root.version == null) {
    root.version = "{{appVersion}}";
  }
  window.PWGLExtensions = root;
  window.AGLExtensions = root;

  return root;
};

export const registerExtensions = (groupName: string, extensions: Record<string, unknown>): ExtensionsRoot => {
  const root = getExtensionsRoot();

  root[groupName] = {
    ...(root[groupName] as Record<string, unknown> | undefined),
    ...extensions,
  };

  return root;
};

export const logExtensions = (): void => {
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
