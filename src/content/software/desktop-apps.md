---
minutes: 8
tech: []
refs:
  - appledev: Human Interface Guidelines, “Designing for macOS”, and “Notarizing macOS software before distribution”
  - pragprog: Topic 38, “Programming by Coincidence”, on relying on the environment
---
Many people do their main work in desktop apps: code editors, design tools, music software, office suites, internal tools in every company. Desktop apps can use large screens, files on disk, many windows and full keyboards. They also bring problems that web developers rarely meet: installers, operating system differences, and updating software on machines that you do not control.

## Ways to build one

- **Native**: each operating system's own tools. WinUI or WPF on Windows, AppKit or SwiftUI on macOS, GTK or Qt on Linux. Fastest and most at home on each platform, and one codebase per platform.
- **Cross-platform native**: **Qt** (C++ or Python) draws real native-looking controls from one codebase.
- **Web technology**: **Electron** packs a Chromium browser and Node.js with your web app. VS Code, Slack and Discord use it. **Tauri** uses the system's own web view instead, so apps are much smaller.

Electron is popular because a web team can ship a desktop app quickly. The cost is size and memory: every Electron app carries its own copy of a browser.

## What desktop users expect

- **Menus and shortcuts** that follow the platform: Ctrl+S on Windows, Cmd+S on macOS.
- **Files**: open, save, recent files, drag and drop, and never losing unsaved work.
- **Windows**: several at once, resizing, remembering their size and place.
- **Working offline**, often for long periods.

## Installers and signing

A user must download and install the app. The operating systems protect users from harmful software, so:

- **Code signing**: you sign the app with a certificate that proves who made it. Unsigned apps show strong warnings, or do not open at all.
- **Notarisation** on macOS: Apple scans the app before it may run without warnings.
- Windows SmartScreen warns about apps from publishers with little reputation.

Plan for signing certificates and these steps from the first release. They take time to set up.

## Updates

On the web, you deploy once and every user has the new version. On the desktop, each machine has its own copy, and many users never update by hand.

- Build **automatic updates** into the app, so it checks for, downloads and installs new versions.
- Expect **many versions in use at once**, for years. Keep file formats and server APIs compatible with old versions.
- Companies may block updates and roll them out themselves.

> **Pitfall.** A file format change that old versions cannot read strands users who share files with colleagues on an older version. Version your file formats and let old readers ignore what they do not understand.

## Differences between systems

Paths, line endings, file name rules, fonts, high-resolution screens and permissions differ between Windows, macOS and Linux. Test on each system you support, in CI if you can, not only on the one you develop on.

## Remember

- Build with native tools, Qt, or web technology in Electron or Tauri.
- Follow each platform's conventions for menus, shortcuts, files and windows.
- Sign the app, and on macOS notarise it, or users see warnings.
- Build in automatic updates, and stay compatible with old versions.

::quiz
? Users of a new desktop app see "unknown developer" warnings and many do not install it. What is missing?
+ Code signing, and notarisation on macOS
- An Electron upgrade
- A faster download server
! Operating systems warn about software that is not signed by a known publisher.
? Why must a desktop app's file format change be handled with care?
+ Many users run older versions for a long time, and must still open shared files
- Desktop apps cannot write files
- File formats never change
! Desktop users do not all update at once. Compatible formats keep colleagues on different versions working together.
::end
