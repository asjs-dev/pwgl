const _getAllProperties = (obj) => {
  const allProps = [];
  let curr = obj;
  do {
    const props = Object.getOwnPropertyNames(curr);
    props.forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(curr, prop);
      allProps.indexOf(prop) === -1 &&
        ((desc.set && desc.get) || desc.value) &&
        allProps.push(prop);
    });
  } while ((curr = Object.getPrototypeOf(curr)));

  return allProps;
};

const _getClassInstance = (type) => new (AGL[type] || window[type])();

export const Parser = {
  get: (obj, stack = []) => {
    const result = {
      _type_: obj.constructor.name,
    };
    _getAllProperties(obj).map((key) => {
      const lowerKey = key.toLowerCase(),
        val = obj[key],
        valType = typeof val;
      if (stack.indexOf(val) < 0) {
        valType === "object" && stack.push(val);

        if (
          valType !== "function" &&
          key.indexOf("_") !== 0 &&
          lowerKey.indexOf("updateid") < 0 &&
          lowerKey.indexOf("cache") < 0 &&
          (key.toUpperCase() !== key || parseInt(key) == key)
        )
          result[key] = valType === "object" ? Parser.get(val, stack) : val;
      }
    });
    return result;
  },

  create: (obj, lightRenderer, metaData) => {
    metaData = metaData || {
      lightId: -1,
    };

    const result =
      obj._type_ === "Light"
        ? lightRenderer
          ? lightRenderer.getLight(++metaData.lightId)
          : null
        : _getClassInstance(obj._type_);

    if (result) {
      for (let key in obj) {
        if (key === "_type_") continue;

        const val = obj[key],
          subResult =
            typeof val === "object"
              ? Parser.create(val, lightRenderer, metaData)
              : val;

        if (subResult !== null) result[key] = subResult;
      }
    }
    return result;
  },
};
