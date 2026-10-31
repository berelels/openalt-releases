# Third-party software

OpenAlt is licensed under the GNU GPL v3.0 or later ([LICENSE](LICENSE)). It is built on, or ships with, the software below. Each one keeps its own license; the license texts are inside the source archive of each release (`openalt-<version>-source.tar.gz`) and, for the PC app, inside the packages.

## Used by OpenAlt (installed separately)

| Software | License | Role |
|---|---|---|
| [Sunshine](https://github.com/LizardByte/Sunshine) by LizardByte | GPL-3.0 | Streaming host on the PC. Not modified; OpenAlt sets it up. |
| [Tailscale](https://tailscale.com) | BSD-3-Clause (client) | Away from home, with your own account. Not bundled. |

## Android app

| Software | License |
|---|---|
| [Moonlight Android](https://github.com/moonlight-stream/moonlight-android) 12.2 (the app is a fork of it) | GPL-3.0 |
| [moonlight-common-c](https://github.com/moonlight-stream/moonlight-common-c) | GPL-3.0 |
| [ENet](https://github.com/cgutman/enet) (Moonlight's fork) | MIT |
| [nanors](https://github.com/sleepybishop/nanors) | MIT |
| [Opus](https://opus-codec.org) | BSD-3-Clause |
| [OpenSSL](https://www.openssl.org) | Apache-2.0 / OpenSSL License |
| [Bouncy Castle](https://www.bouncycastle.org) | MIT |
| [OkHttp](https://square.github.io/okhttp/) | Apache-2.0 |
| [JmDNS](https://github.com/jmdns/jmdns) | Apache-2.0 |
| [JCodec](http://jcodec.org) | BSD-2-Clause |
| [ShieldControllerExtensions](https://github.com/cgutman/ShieldControllerExtensions) | BSD-3-Clause |
| [ZXing Android Embedded](https://github.com/journeyapps/zxing-android-embedded) and [ZXing](https://github.com/zxing/zxing) | Apache-2.0 |
| [AndroidX](https://developer.android.com/jetpack/androidx) | Apache-2.0 |

## PC app

| Software | License |
|---|---|
| [Electron](https://www.electronjs.org) (with Chromium and Node.js) | MIT, plus the licenses in `LICENSES.chromium.html` inside the package |
| [node-qrcode](https://github.com/soldair/node-qrcode) | MIT |
| [Material Symbols](https://github.com/marella/material-symbols) (Google) | Apache-2.0 |

## Fonts (PC app, Android app and website)

| Font | License |
|---|---|
| [Newsreader](https://github.com/productiontype/Newsreader) | SIL Open Font License 1.1 |
| [Plus Jakarta Sans](https://github.com/tokotype/PlusJakartaSans) | SIL Open Font License 1.1 |
| [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | SIL Open Font License 1.1 |

## Website

| Software | License |
|---|---|
| [GSAP](https://gsap.com) 3.13 and ScrollTrigger (in `site/vendor/`) | [Standard No-Charge License](https://gsap.com/standard-license) (not GPL) |

The website itself (`site/`) is GPL-3.0, like the rest of OpenAlt. It loads nothing from other servers, has no analytics and no cookies, and only remembers the language you pick (`localStorage`).
