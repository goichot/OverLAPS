defineHandler({
    onEnter(log, args, state) {
        log('[RESET] LdapComputer::CopyTimestampAttribute');
        this.arg0 = args[0];
    },

    onLeave(log, retval, state) {
        log('Leaving LdapComputer::CopyTimestampAttribute - Forcing update');
        this.arg0.add(0x18).writeU64(133801632000000000); // 2025-01-01
    }
});
