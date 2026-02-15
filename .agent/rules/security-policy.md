---
trigger: always_on
---

# Antigravity Agent Security Policy (Strict Mode)

**Version:** 1.0
**Philosophy:** Zero Trust / Default Deny
**Objective:** To prevent malicious script injection, data exfiltration, and accidental or intentional file destruction.

---

## 1. Auto-Execution Protocol
The `SafeToAutoRun` parameter determines if a command runs immediately or requires user approval.

- **DEFAULT POLICY**: `SafeToAutoRun` MUST be set to `FALSE` (Request Human Review).
- **STRICT EXCEPTION**: `SafeToAutoRun` MAY be set to `TRUE` **only** if ALL of the following conditions are met:
    1.  The command matches a pattern in the **Allow List** exactly.
    2.  The command contains **NO** chaining or redirection operators: `|`, `;`, `&&`, `>`, `>>`, `$(`, `` ` ``.
    3.  The command references **NO** paths listed in the **Sensitive Paths** section.
    4.  The command uses **NO** force flags (e.g., `-f`, `--force`, `-y`, `--hard`).
    5.  The command uses **NO** wildcards (`*`) that could affect multiple files unintentionally.

---

## 2. Deny List (Prohibited for Auto-Run)
Commands matching these patterns are considered **CRITICAL RISKS**. They MUST NEVER be auto-run and always require explicit user confirmation with a warning about the specific risk.

### A. Filesystem Destruction & Modification
* **Deletion:** `rm`, `del`, `erase`, `shred`, `git clean`
* **Silent Modification:** `sed -i`, `awk` (with write), `dd`, `truncate`
* **Overwrite/Move:** `mv`, `cp`, `> ` (overwrite redirection)
* **Injection/Append:** `>> ` (append redirection - *High Risk of Script Injection*)
* **Permissions:** `chmod`, `chown`, `icacls`, `attrib`, `takeown`

### B. Remote Code Execution (RCE) & Script Injection
* **Piping to Shell:** Any command followed by `| sh`, `| bash`, `| zsh`, `| python`, `| perl`
* **Remote Execution:** `curl ... | sh`, `wget ... | sh`
* **Script Execution:** `./*.sh`, `./*.bat`, `./*.ps1`, `./*.py`, `source .*`
* **Payload Obfuscation:** `base64 -d`, `openssl`, `xxd` (often used to hide malicious payloads)
* **Editors:** `vim`, `nano`, `code`, `emacs` (interactive mode risks)

### C. Network & Data Exfiltration
* **Data Transfer:** `curl`, `wget`, `scp`, `ftp`, `sftp`, `tftp`
* **Reverse Shells/Tunnels:** `nc` (netcat), `ncat`, `ngrok`, `localtunnel`, `telnet`
* **SSH Operations:** `ssh`, `ssh-keygen`, `ssh-copy-id`

---

## 3. Data Loss Prevention (DLP)
To prevent data leakage, the Agent MUST NOT read, print, or exfiltrate contents from specific sensitive locations, even using "safe" commands like `cat` or `grep`.

### A. Sensitive Paths (Read/Write Forbidden)
Any command referencing these strings in the file path is **strictly prohibited**:
* **Credentials:** `.env`, `config.json`, `secrets.yaml`, `credentials`, `token`
* **Identity Keys:** `.ssh/`, `id_rsa`, `id_ed25519`, `.pem`, `.key`, `.gnupg/`
* **System/Root:** `/etc/shadow`, `/etc/passwd`, `C:\Windows\System32`
* **Shell History:** `.bash_history`, `.zsh_history`, `.python_history`
* **Cloud Configs:** `.aws/`, `.azure/`, `.gcloud/`, `.kube/config`

### B. Environment Variable Protection
* **Blocking Dumps:** `env`, `printenv`, `export`, `set` (without arguments) are prohibited to prevent leaking API keys stored in memory.

---

## 4. Allow List (Permitted for Auto-Run)
Only commands strictly related to **Passive Read** and **System State** are permitted for auto-execution, provided they pass the *Sensitive Paths* check.

### Read Operations (Text Only)
* `cat [file]`, `head [file]`, `tail [file]` (Must verify file extension is not binary or sensitive)
* `grep`, `findstr` (Search within files)
* `more`, `less` (If non-interactive output is guaranteed)

### System & Directory State
* `ls`, `dir` (List directory contents)
* `pwd`, `cd` (Check or change location - strictly within workspace)
* `tree -L 2` (Limit depth to prevent buffer overflow)
* `whoami`, `date`, `echo "string"` (Simple echo without redirection)

### Git (Read-Only)
* `git status`
* `git log --oneline`
* `git diff`
* `git branch`
* `git remote -v`

---

## 5. Execution Sandbox (Mandatory)
* **Path Confinement:** The Agent should operate strictly within a designated `./workspace` directory. Attempts to traverse up (`../`) beyond the root of the workspace must be blocked.
* **Wildcard Sanitization:** The Agent must not use unquoted wildcards (`rm *`, `cat *`) in auto-run mode to prevent unintended mass actions.