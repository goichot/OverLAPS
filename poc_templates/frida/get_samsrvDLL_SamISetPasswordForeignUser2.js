const moduleName = 'samsrv.dll';
const targetFunctionName = 'SamISetPasswordForeignUser2'

const targetModule = Process.enumerateModules().find(mod => mod.name.toLowerCase().includes(moduleName.toLowerCase()));

if (targetModule !== undefined) {
    const baseAddr = targetModule.base;
    const targetFuncAddr = targetModule.getExportByName(targetFunctionName);
    console.log(`[+] Base address of ${moduleName}: ${baseAddr}`);
    console.log(`[+] Hooking function ${targetFunctionName} at address: ${targetFuncAddr}`);

    Interceptor.attach(targetFuncAddr, {
        onEnter: function (args) {
            console.log('[GET] SamISetPasswordForeignUser2');
            
                    const usernamePtr = args[2].add(8).readPointer();
                    const passwordPtr = args[3].add(8).readPointer();
            
                    const username = usernamePtr.readUtf16String();
                    const password = passwordPtr.readUtf16String();
            
                    console.log(` --> Username: (${usernamePtr}) ${username} / Password: (${passwordPtr}) ${password}`);
        },
        onLeave: function (retval) {
            // No operation
        }
    });
} else {
    console.error(`[-] Could not find base address for ${moduleName}`);
}
