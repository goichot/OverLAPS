defineHandler({
    onEnter(log, args, state) {
        log('[RESET] LapsCore::CheckADPasswordUpdateFactors');
        this.arg5 = args[5];
    },

    onLeave(log, retval, state) {
        log('Leaving LapsCore::CheckADPasswordUpdateFactors - Forcing update');
        this.arg5.writeULong(1);
    }
});
