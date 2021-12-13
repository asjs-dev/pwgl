const _getAllProperties = (obj) => {
	const allProps = [];
	let curr = obj;
	do {
		const props = Object.getOwnPropertyNames(curr);
		props.forEach((prop) => {
			const desc = Object.getOwnPropertyDescriptor(curr, prop);
			allProps.indexOf(prop) === -1 && (desc.set && desc.get || desc.value) &&
				allProps.push(prop);
		});
	} while (curr = Object.getPrototypeOf(curr));

	return allProps;
};

export const Parser = {
	get : (obj, stack = []) => {
		const result = {};
		_getAllProperties(obj).map((key) => {
			const lowerKey = key.toLowerCase();
			const val = obj[key];
			const valType = typeof val;
			if (stack.indexOf(val) < 0) {
				valType === "object" && stack.push(val);

				if (
					valType !== "function" &&
					key.indexOf("_") !== 0 &&
					lowerKey.indexOf("updateid") < 0 &&
					lowerKey.indexOf("cache") < 0 &&
					(
						key.toUpperCase() !== key ||
						parseInt(key) == key
					)
				)
					result[key] = valType === "object"
						? Parser.get(val, stack)
						: val;
			}
		});
		return result;
	},

	set : (target, obj) => {
		for (let key in obj) {
			const val = obj[key];
			typeof val === "object"
        ? Parser.set(target[key], val)
        : (target[key] = val);
		}
	}
};
