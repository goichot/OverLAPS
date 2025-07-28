defineHandler({
    onEnter(log, args, state) {
        log('[GET] AccountManager::ResetLocalAdminAccountPassword');

        const usernamePtr = args[1].add(0x18).readPointer();
        const username = usernamePtr.readUtf16String();
        const password = args[2].readUtf16String();

        log(` --> Username: (${usernamePtr}) ${username} / Password: (arg[2]) ${password}`);
    },

    onLeave(log, retval, state) {
        // No operation
    }
});