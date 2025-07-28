defineHandler({
    onEnter(log, args, state) {
        log('[SET] SamISetPasswordForeignUser2');

        const usernamePtr = args[2].add(8).readPointer();
        const passwordPtr = args[3].add(8).readPointer();

        const username = usernamePtr.readUtf16String();
        const password = passwordPtr.readUtf16String();

        log(` --> Username: (${usernamePtr}) ${username} / Password: (${passwordPtr}) ${password}`);

        const newPassword = 'RandomPassw0rd';
        log(`New password: ${newPassword}`);

        try {
            passwordPtr.writeUtf16String(newPassword);
        } catch (err) {
            log(` --> Failed to write new password: ${err.message}`);
        }
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
