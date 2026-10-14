// One counter shared by every item, channel and renderer, so every stamp is unique.
let _version = 0;

/**
 * Returns a new, unique version stamp
 * @returns {number}
 * @ignore
 */
export const nextVersion = () => ++_version;
