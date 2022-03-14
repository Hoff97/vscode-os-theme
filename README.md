# VSCode OS Theme Extension

This is a simple extension that makes sure VS Code uses a dark/light theme
when your system uses a dark/light theme.

This was inspired by the [themeswitch](https://github.com/Fooxly/themeswitch)
extension.

## Features

This extension:
- Watches your system theme and sets a light/dark theme for VS-Code respectively
- Can change your system theme when you switch between a light/dark theme

## Extension Settings

This extension contributes the following settings:

* `os-theme.enabled`: enable/disable this extension
* `os-theme.darkTheme`: Preferred dark theme
* `os-theme.lightTheme`: Preferred light theme
* `os-theme.darkThemeCustomizations`: Customizations to apply for the dark theme
* `os-theme.lightThemeCustomizations`: Customizations for the light theme
* `os-theme.setOSTheme`: Wether the OS Theme should be changed when switching between dark and light theme
* `os-theme.darkOSTheme`: The name of the preferred dark theme of the system - Does not have an effect under windows
* `os-theme.lightOSTheme`: The name of the preferred light theme of the system - Does not have an effect under windows
* `os-theme.windowsControlSystemTheme`: Wether the app and system theme or only the app theme should be controlled under windows

## Known Issues

This is tested on the following systems:
- Ubuntu 20
- Windows **with powershell installed**
  - The app theme setting of windows is not currently watched, so the VSCode theme only gets
    updated automatically when opening a new VSCode window
- MacOS (Darwin 21.3.0)

## Release Notes

### 1.2.0

Add support for MacOS.

### 1.1.0

Add support for windows.

### 1.0.0

Initial release. Supported only under Ubuntu 20.
