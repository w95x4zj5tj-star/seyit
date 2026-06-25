#!/usr/bin/env python3
"""Drive `claude mcp login higgsfield` under a PTY so OAuth can complete headlessly.
Prints the auth URL, then waits for the redirect URL to appear in REDIRECT_FILE and
feeds it to the login process's stdin."""
import os, pty, select, sys, time, re

REDIRECT_FILE = '/tmp/hf_redirect.txt'
LOG = '/tmp/hf_login.log'
if os.path.exists(REDIRECT_FILE):
    os.remove(REDIRECT_FILE)

logf = open(LOG, 'w')
pid, fd = pty.fork()
if pid == 0:
    os.execvp('claude', ['claude', 'mcp', 'login', 'higgsfield'])
    os._exit(1)

sent = False
buf = b''
start = time.time()
while True:
    if time.time() - start > 1200:  # 20 min cap
        logf.write('\n[TIMEOUT]\n'); logf.flush(); break
    r, _, _ = select.select([fd], [], [], 1.0)
    if r:
        try:
            data = os.read(fd, 4096)
        except OSError:
            break
        if not data:
            break
        sys.stdout.buffer.write(data); sys.stdout.flush()
        logf.write(data.decode('utf-8', 'replace')); logf.flush()
        buf += data
    # when redirect URL provided, type it in
    if not sent and os.path.exists(REDIRECT_FILE):
        url = open(REDIRECT_FILE).read().strip()
        if url:
            time.sleep(0.5)
            os.write(fd, url.encode() + b'\n')
            sent = True
            logf.write('\n[REDIRECT URL SENT]\n'); logf.flush()
    # detect completion
    low = buf[-400:].lower()
    if b'authenticated' in low or b'success' in low or b'connected' in low:
        time.sleep(1)
        # drain
        r2,_,_ = select.select([fd],[],[],2.0)
        if r2:
            try: os.read(fd,4096)
            except OSError: pass
        logf.write('\n[DONE]\n'); logf.flush()
        break

try:
    os.close(fd)
except OSError:
    pass
print('\n[hf_login wrapper exited]')
