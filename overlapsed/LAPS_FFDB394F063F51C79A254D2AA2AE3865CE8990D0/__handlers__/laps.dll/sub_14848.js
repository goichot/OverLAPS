defineHandler({
    onEnter(log, args, state) {
        log('[GET] AccountManager::UpdateStateOnSuccess');

        const usernamePtr = args[0].add(0x58).readPointer();
        const passwordPtr = args[1];

        const username = usernamePtr.readUtf16String();
        const password = passwordPtr.readUtf16String();

        log(` --> Username: (${usernamePtr}) ${username} / Password: (${passwordPtr}) ${password}`);
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
