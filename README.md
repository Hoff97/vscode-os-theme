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
* `os-theme.darkOSTheme`: The name of the preferred dark theme of the system
* `os-theme.lightOSTheme`: The name of the preferred light theme of the system

## Known Issues

This was only tested under Ubuntu 20. It assumes that the system theme
is managed via gsettings.

## Release Notes

### 1.0.0

Initial release. Supported only under Ubuntu 20.
