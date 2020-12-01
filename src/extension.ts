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
let windowsControlSystemTheme: boolean;

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
  windowsControlSystemTheme = extensionConfig.windowsControlSystemTheme;
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.workspace.onDidChangeConfiguration(updateSettings);
	updateSettings();

	if (enabled) {
		getCurrentOSTheme();

		watchOSTheme();
	}

	vscode.commands.registerCommand(extPrefix + '.switchToDarkTheme', () => {
		setDarkTheme(true);
	});

	vscode.commands.registerCommand(extPrefix + '.switchToLightTheme', () => {
		setLightTheme(true);
	});

	vscode.commands.registerCommand(extPrefix + '.enable', () => {
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
export function deactivate() {
	if (proc) {
		proc.kill("SIGINT");
	}
}

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

function getCurrentOSTheme() {
	if (process.platform === 'win32') {
		const command = 'powershell Get-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme';
		cp.exec(command, parseOSTheme);
	} else {
		cp.exec('gsettings get org.gnome.desktop.interface gtk-theme', parseOSTheme);
	}
}

function watchOSTheme() {
	if (process.platform === 'win32') {

	} else {
		proc = cp.spawn('gsettings monitor org.gnome.desktop.interface gtk-theme', {
			shell: true
		});
	
		proc.stdout.on('data', (data) => {
			// Data is not actually the current theme for whatever reason
			getCurrentOSTheme();
		});
	}
}

function parseOSTheme(err: ExecException | null, stdout: string | Buffer, stderr: string | Buffer) {
	if (err !== null) {
		vscode.window.showErrorMessage('OS Theme extension could not get the current OS theme!');
		return;
	}

	if (process.platform === 'win32') {
		const match = stdout.toString().match('AppsUseLightTheme : ([0|1])');
		if (match !== null) {
			const lightTheme = match[1] === '1';
			if (lightTheme) {
				setLightTheme(false);
			} else {
				setDarkTheme(false);
			}
			return;
		}
	} else {
		if (stdout.toString().search("light") !== -1) {
			setLightTheme(false);
			return;
		} else if (stdout.toString().search("dark") !== -1) {
			setDarkTheme(false);
			return;
		}
	}
	vscode.window.showErrorMessage(`Could not determine os theme from command output: ${stdout}`);
}

function setOSTheme(theme: string) {
	if (process.platform === 'win32') {
		const light = theme === lightOSTheme ? 1 : 0;
		const command = `powershell New-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name AppsUseLightTheme -Value ${light} -Type Dword -Force`;

		cp.exec(command);

		if (windowsControlSystemTheme) {
			const command = `powershell New-ItemProperty -Path HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize -Name SystemUsesLightTheme -Value ${light} -Type Dword -Force`;

			cp.exec(command);
		}
	} else {
		let command = `gsettings set org.gnome.desktop.interface gtk-theme ${theme}`;
		cp.exec(command);
	}
}