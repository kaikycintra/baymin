# Baymin Development Setup

Baymin uses [mise](https://mise.jdx.dev/) to manage language runtimes (Python, Node) and automate development tasks.

## Prerequisites

Before starting, you must install:
- **mise**: Follow the [official installation guide](https://mise.jdx.dev/getting-started.html).
- **Docker**: Required for isolating and compiling user C++/OpenGL code via Emscripten.

## 1. Install Runtimes

```bash
mise install
```