## 2024-05-24 - [Path Traversal in Files Service via Incomplete String Checks]
**Vulnerability:** The application attempted to prevent path traversal in `FilesService.getFile` and `FilesService.getPublicFile` by simply checking if the filename string contained `..` (`filename.includes("..")`). This is insufficient because it fails to protect against absolute paths (e.g., `/etc/passwd`), URL-encoded paths, or certain unicode variations if the input wasn't strictly parsed earlier.

**Learning:** When dealing with dynamic file access paths based on user input, string inclusion checks are easily bypassed. Moreover, replacing them with a prefix check without appending a path separator to the base directory (`targetPath.startsWith(basePath)`) introduces a Partial Directory Match vulnerability. If `basePath` is `/uploads/public`, an attacker could request `../public_secrets/key.txt` which resolves to `/uploads/public_secrets/key.txt` and bypasses the check.

**Prevention:** To reliably prevent path traversal and partial directory match vulnerabilities:
1. Always resolve paths to absolute formats using `path.resolve`.
2. Ensure the resolved `targetPath` starts with the `basePath` **appended with a trailing slash** (`targetPath.startsWith(basePath + '/')`) to strictly constrain access within the intended directory and prevent accessing sibling directories that share a prefix.