import Exponent from 'exponent';

// We will refer to assets by a 'friendly name' such as 'splash-sound' or
// 'player-sprite', offering an additional level of indirection over the
// actual file paths.

// Map of asset names to modules. List your assets here.
const modules = {
  'tiles': require('./tiles.png'),
}

// Export map of asset names to `Exponent.Asset` objects.
export default Object.assign({}, ...Object.keys(modules).map((name) =>
  ({ [name]: Exponent.Asset.fromModule(modules[name]) })));
