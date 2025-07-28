defineHandler({
    onEnter(log, args, state) {
        log('[GET] LdapComputer::BuildPasswordJson');

        const username = args[1].readUtf16String();
        const password = args[2].readUtf16String();

        log(`--> Username (args[1]): ${username} / Password (args[2]): ${password}`);
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
