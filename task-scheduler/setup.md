# Task Scheduler Setup

## Purpose
Run PaSoRi auto-attach script at logon.

## Recommended Settings

- Trigger: At log on
- Program/script: pwsh
- Add arguments: -File "C:\\Users\\makoto\\Desktop\\pasori-wsl-auto-attach\\scripts\\attach-pasori.ps1"
- Run with highest privileges: enabled

## Notes

- The script uses usbipd command syntax with --wsl.
- If distro name is different, edit scripts/config.ps1.
