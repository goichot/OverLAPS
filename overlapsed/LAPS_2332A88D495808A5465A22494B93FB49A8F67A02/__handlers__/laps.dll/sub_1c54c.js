defineHandler({
    onEnter(log, args, state) {
        log('[RESET] LapsCore::CheckAzurePasswordUpdateFactors');
        this.arg5 = args[5];
    },

    onLeave(log, retval, state) {
        log('Leaving LapsCore::CheckAzurePasswordUpdateFactors - Forcing update');
        this.arg5.writeULong(1);
    }
});
