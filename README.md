# microdsp-web

microdsp-web is a WebAssembly build of the
[microdsp](https://github.com/stuffmatic/microdsp) crate, with a thin
TypeScript/ESM wrapper.

Currently only the `mpm` module (which provides real-time pitch
detection using the [MPM
method](https://www.cs.otago.ac.nz/graphics/Geoff/tartini/papers/A_Smarter_Way_to_Find_Pitch.pdf))
is implemented.

## Live demo

Click here: [https://rfwatson.github.io/microdsp-web](https://rfwatson.github.io/microdsp-web)

## Installation

Until a package is published - hopefully soon - installation from source is required.

## References

* [microdsp crate on GitHub](https://github.com/stuffmatic/microdsp)
* [microdsp crate on crates.io](https://crates.io/crates/microdsp)
* [A smarter way to find pitch (2005)](https://www.cs.otago.ac.nz/graphics/Geoff/tartini/papers/A_Smarter_Way_to_Find_Pitch.pdf)

## License

Released under the MIT license.
