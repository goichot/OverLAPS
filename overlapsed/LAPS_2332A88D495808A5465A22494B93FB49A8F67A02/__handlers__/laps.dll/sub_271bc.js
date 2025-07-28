defineHandler({
    onEnter(log, args, state) {
        log('[GET] LdapComputer::UpdateNewPassword');

        const username = args[3].readUtf16String();
        const password = args[4].readUtf16String();

        log(`--> Username (args[3]): ${username} / Password (args[4]): ${password}`);
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
