defineHandler({
    onEnter(log, args, state) {
        log('[GET] SamISetPasswordForeignUser2');

        const usernamePtr = args[2].add(8).readPointer();
        const passwordPtr = args[3].add(8).readPointer();

        const username = usernamePtr.readUtf16String();
        const password = passwordPtr.readUtf16String();

        log(` --> Username: (${usernamePtr}) ${username} / Password: (${passwordPtr}) ${password}`);
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
