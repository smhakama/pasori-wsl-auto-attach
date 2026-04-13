# PaSoRi Auto Attach for WSL2 (usbipd)

Automatically detect and attach Sony RC-S380 (PaSoRi) to WSL2.

## Features

- Auto detection via VID:PID
- Multi-device support
- Auto reattach loop
- Works with usbipd-win v5.x (`--wsl` required)

---

## Requirements

- Windows 10/11
- WSL2
- usbipd-win
- PowerShell 7

---

## Quick Start

```powershell
git clone https://github.com/YOURNAME/pasori-wsl-auto-attach.git
cd pasori-wsl-auto-attach/scripts
pwsh ./attach-pasori.ps1