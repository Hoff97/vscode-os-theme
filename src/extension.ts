import * as vscode from 'vscode';

import * as cp from 'child_process';
import { ExecException } from 'child_process';

const userConfig = vscode.workspace.getConfiguration();
let extensionConfig;
let darkTheme: string, lightTheme: string;
let darkThemeCustomizations: object, lightThemeCustomizations: object;
let enabled: boolean;
let settingSetOSTheme: boolean;
let darkOSTheme: string;
let lightOSTheme: string;

const extPrefix = "os-theme";
const themeKey = "workbench.colorTheme";

let proc: cp.ChildProcessWithoutNullStreams;

function updateSettings() {
  extensionConfig = vscode.workspace.getConfiguration(extPrefix);
  darkTheme = extensionConfig.darkTheme;
  lightTheme = extensionConfig.lightTheme;
  darkThemeCustomizations = extensionConfig.darkThemeCustomizations;
  lightThemeCustomizations = extensionConfig.lightThemeCustomizations;
  enabled = extensionConfig.enabled;
  settingSetOSTheme = extensionConfig.setOSTheme;
  darkOSTheme = extensionConfig.darkOSTheme;
  lightOSTheme = extensionConfig.lightOSTheme;
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.workspace.onDidChangeConfiguration(updateSettings);
	updateSettings();

	if (enabled) {
		cp.exec('gsettings get org.gnome.desktop.interface gtk-theme', parseOSTheme);

		proc = cp.spawn('gsettings monitor org.gnome.desktop.interface gtk-theme', {
			shell: true
		});

		proc.stdout.on('data', (data) => {
			// Data is not actually the current theme for whatever reason
			cp.exec('gsettings get org.gnome.desktop.interface gtk-theme', parseOSTheme);
		});
	}

	vscode.commands.registerCommand(extPrefix + '.switchToDarkTheme', () => {
		setDarkTheme(true);
	});

	vscode.commands.registerCommand(extPrefix + '.switchToLightTheme', () => {
		setLightTheme(true);
	});

	vscode.commands.registerCommand(extPrefix + '.toggle', () => {
		userConfig.update(extPrefix + ".enabled", !enabled, true);
		enabled = !enabled;
	});

	vscode.commands.registerCommand(extPrefix + '.toggleLightDarkTheme', () => {
		let currentTheme = vscode.workspace.getConfiguration().get(themeKey);
		if (currentTheme === lightTheme) {
			setDarkTheme(true);
		} else if (currentTheme === darkTheme) {
			setLightTheme(true);
		} else {
			let toggleDefaultDark = vscode.workspace.getConfiguration().get(extPrefix + '.toggleDefaultDark');
			if (toggleDefaultDark) {
				setDarkTheme(true);
			} else {
				setLightTheme(true);
			}
		}
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function setLightTheme(updateOS = true) {
	userConfig.update(themeKey, lightTheme, true);
	userConfig.update("workbench.colorCustomizations", lightThemeCustomizations, true);

	if (settingSetOSTheme && updateOS) {
		setOSTheme(lightOSTheme);
	}
}

function setDarkTheme(updateOS: boolean) {
	userConfig.update(themeKey, darkTheme, true);
	userConfig.update("workbench.colorCustomizations", darkThemeCustomizations, true);

	if (settingSetOSTheme && updateOS) {
		setOSTheme(darkOSTheme);
	}
}

function parseOSTheme(err: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) {
	console.log(err, stdout, stderr);
	if (err !== null) {
		vscode.window.showErrorMessage('OS Theme extension could not get the current OS theme!');
		return;
	}

	if (stdout.toString().search("light") !== -1) {
		setLightTheme(false);
	} else if (stdout.toString().search("dark") !== -1) {
		setDarkTheme(false);
	} else {
		vscode.window.showErrorMessage(`Could not determine os theme from command output: ${stdout}`);
	}
}

function setOSTheme(theme: string) {
	let command = `gsettings set org.gnome.desktop.interface gtk-theme ${theme}`;
	cp.exec(command, (err: any, out: any) => {
		console.log('Theme set');
	});
}